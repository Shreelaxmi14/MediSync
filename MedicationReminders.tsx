
import React, { useEffect, useRef, useState } from "react";

type Reminder = {
  id: string;
  medicine: string;
  dateTime: string;
  notified: boolean;
  taken: boolean;
};

const STORAGE_KEY = "medisync-reminders";

function loadReminders(): Reminder[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}


function playAlarm() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();

    const masterGain = context.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(context.destination);

    const startTime = context.currentTime;
    const duration = 20;

    // Gentle two-note chime, repeated with pauses.
    for (let cycle = 0; cycle < 10; cycle++) {
      const cycleStart = startTime + cycle * 2;

      [523.25, 659.25].forEach((frequency, index) => {
        const noteStart = cycleStart + index * 0.45;
        const noteEnd = noteStart + 0.65;

        const oscillator = context.createOscillator();
        const noteGain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        // Smooth fade-in and fade-out.
        noteGain.gain.setValueAtTime(0, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.5, noteStart + 0.12);
        noteGain.gain.setValueAtTime(0.5, noteStart + 0.3);
        noteGain.gain.linearRampToValueAtTime(0, noteEnd);

        oscillator.connect(noteGain);
        noteGain.connect(masterGain);

        oscillator.start(noteStart);
        oscillator.stop(noteEnd + 0.05);
      });
    }

    // Clean up after 20 seconds.
    window.setTimeout(() => {
      void context.close();
    }, duration * 1000);

  } catch (error) {
    console.error("Could not play alarm:", error);
  }
}



export default function MedicationReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);
  const [medicine, setMedicine] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [permission, setPermission] = useState(
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission
  );
  const [message, setMessage] = useState("");

  // Keep the latest reminders available to the timer.
  const remindersRef = useRef(reminders);

  useEffect(() => {
    remindersRef.current = reminders;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      setMessage("This browser does not support notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      setMessage("Notifications enabled!");
    } else {
      setMessage("Notification permission was not granted.");
    }
  }

  function addReminder(event: React.FormEvent) {
    event.preventDefault();

    if (!medicine.trim() || !dateTime) {
      setMessage("Enter a medicine name and reminder time.");
      return;
    }

    if (new Date(dateTime).getTime() <= Date.now()) {
      setMessage("Please choose a future reminder time.");
      return;
    }

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      medicine: medicine.trim(),
      dateTime,
      notified: false,
      taken: false,
    };

    setReminders((previous) => [...previous, newReminder]);
    setMedicine("");
    setDateTime("");
    setMessage("Medication reminder added!");
  }

  function markTaken(id: string) {
    setReminders((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, taken: true } : item
      )
    );
  }

  function snoozeReminder(id: string) {
    const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
    const localDateTime = new Date(
      snoozeTime.getTime() - snoozeTime.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setReminders((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, dateTime: localDateTime, notified: false }
          : item
      )
    );

    setMessage("Reminder snoozed for 10 minutes.");
  }

  function deleteReminder(id: string) {
    setReminders((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  // Check for reminders every 5 seconds.
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();

      remindersRef.current.forEach((reminder) => {
        const scheduledTime = new Date(reminder.dateTime).getTime();

        if (
          !reminder.taken &&
          !reminder.notified &&
          scheduledTime <= now
        ) {
          // Mark it first to prevent duplicate alerts.
          setReminders((previous) =>
            previous.map((item) =>
              item.id === reminder.id
                ? { ...item, notified: true }
                : item
            )
          );

          playAlarm();

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("MediSync Medication Reminder", {
              body: `It is time for your scheduled medicine: ${reminder.medicine}`,
              icon: "/favicon.ico",
              tag: reminder.id,
            });
          }

          setMessage(`Reminder: It is time for ${reminder.medicine}.`);
        }
      });
    };

    checkReminders();
    const timer = window.setInterval(checkReminders, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main style={styles.container}>
      <h1>💊 MediSync Smart Reminders</h1>
      <p>Schedule and manage your medication reminders.</p>

      <section style={styles.card}>
        <h2>Notification Settings</h2>

        <p>
          Notification permission: <strong>{permission}</strong>
        </p>

        <button onClick={enableNotifications} style={styles.button}>
          Enable Browser Notifications
        </button>
      </section>

      <section style={styles.card}>
        <h2>Schedule a Medication</h2>

        <form onSubmit={addReminder}>
          <label style={styles.label}>
            Medicine name
            <input
              style={styles.input}
              value={medicine}
              onChange={(event) => setMedicine(event.target.value)}
              placeholder="Enter prescribed medicine name"
              required
            />
          </label>

          <label style={styles.label}>
            Reminder date and time
            <input
              style={styles.input}
              type="datetime-local"
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)}
              required
            />
          </label>

          <button type="submit" style={styles.button}>
            + Add Reminder
          </button>
        </form>
      </section>

      {message && (
        <p role="status" style={styles.message}>
          {message}
        </p>
      )}

      <section style={styles.card}>
        <h2>My Medication Schedule</h2>

        {reminders.length === 0 ? (
          <p>No reminders scheduled yet.</p>
        ) : (
          reminders
            .slice()
            .sort(
              (a, b) =>
                new Date(a.dateTime).getTime() -
                new Date(b.dateTime).getTime()
            )
            .map((reminder) => (
              <article key={reminder.id} style={styles.reminder}>
                <h3>{reminder.medicine}</h3>

                <p>
                  {new Date(reminder.dateTime).toLocaleString()}
                </p>

                <p>
                  Status:{" "}
                  <strong>
                    {reminder.taken
                      ? "Taken"
                      : reminder.notified
                      ? "Reminder sent — awaiting confirmation"
                      : "Scheduled"}
                  </strong>
                </p>

                {!reminder.taken && (
                  <div style={styles.actions}>
                    <button
                      onClick={() => markTaken(reminder.id)}
                      style={styles.button}
                    >
                      Mark as Taken
                    </button>

                    <button
                      onClick={() => snoozeReminder(reminder.id)}
                      style={styles.secondaryButton}
                    >
                      Snooze 10 min
                    </button>
                  </div>
                )}

                <button
                  onClick={() => deleteReminder(reminder.id)}
                  style={styles.deleteButton}
                >
                  Delete reminder
                </button>
              </article>
            ))
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "760px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    color: "#17324d",
  },
  card: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "14px",
    marginTop: "20px",
    border: "1px solid #dce6ee",
    boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
  },
  label: {
    display: "block",
    marginBottom: "16px",
    fontWeight: 600,
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginTop: "8px",
    border: "1px solid #bdcbd8",
    borderRadius: "8px",
    fontSize: "15px",
  },
  button: {
    background: "#087f8c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    cursor: "pointer",
    marginRight: "8px",
    marginTop: "8px",
  },
  secondaryButton: {
    background: "#e5f1f4",
    color: "#075c68",
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    cursor: "pointer",
    marginTop: "8px",
  },
  deleteButton: {
    background: "transparent",
    color: "#b42318",
    border: "none",
    padding: "10px 0",
    cursor: "pointer",
  },
  reminder: {
    padding: "15px 0",
    borderBottom: "1px solid #e5edf2",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  message: {
    padding: "12px",
    background: "#e7f5f3",
    borderRadius: "8px",
  },
};

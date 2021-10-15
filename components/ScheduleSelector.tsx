import { Formik } from "formik";
import { createEvent, createEvents } from "ics";
import { DateTime } from "luxon";
import { FunctionComponent, useContext, useState } from "react";
import useSWR from "swr";
import { Context } from "./context";

interface Lesson {
  start: string;
  end: string;
  course: string;
  location?: string;
  teacher?: string;
}

async function fetchLessons(date: DateTime, token: string): Promise<Lesson[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}/lessons?year=${date.weekYear}&week=${date.weekNumber}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

function toDateArray(date: DateTime): [number, number, number, number, number] {
  return [date.year, date.month, date.day, date.hour, date.minute];
}

function toIcal(lessons: Lesson[]): string {
  const { error, value } = createEvents(
    lessons.map((lesson) => {
      const { course, location, teacher } = lesson;
      const start = DateTime.fromISO(lesson.start);
      const end = DateTime.fromISO(lesson.end);

      console.log(teacher);

      return {
        start: toDateArray(start),
        startInputType: "utc",
        end: toDateArray(end),
        endInputType: "utc",
        title: course,
        location: location,
        description: teacher,
      };
    })
  );

  if (error) {
    throw error;
  }

  return value;
}

interface Values {
  start: string;
  end: string;
}

const ScheduleSelector: FunctionComponent = () => {
  const { token } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>();
  const [ical, setIcal] = useState<string>();

  async function handleSubmit(values: Values) {
    setLoading(true);
    setLessons(undefined);
    setIcal(undefined);

    const start = DateTime.fromISO(values.start);
    const end = DateTime.fromISO(values.end);

    const cursors = [];

    let current = start;
    while (current < end) {
      cursors.push(current);
      current = current.plus({ weeks: 1 });
    }

    try {
      const results = await Promise.all(
        cursors.map((cursor) => fetchLessons(cursor, token))
      );

      const lessons = results.flat();

      setLessons(lessons);
      setIcal(toIcal(lessons));
    } catch (error) {
      alert("ett fel uppstod!");
    } finally {
      setLoading(false);
    }
  }

  const file = ical ? new Blob([ical], { type: "text/calendar" }) : undefined;
  const url = file ? URL.createObjectURL(file) : undefined;

  return (
    <>
      <p>
        Välj tidsintervall och börja ladda ner schemat. Det kan ta uppemot en
        minut beroende på hur många veckor du väljer, så ha tålamod.
      </p>
      <Formik
        initialValues={{
          start: DateTime.now().toISODate(),
          end: DateTime.now().plus({ weeks: 4 }).toISODate(),
        }}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <label htmlFor="start">Från</label>
            <input
              id="start"
              name="start"
              type="date"
              max={formik.values.end}
              onChange={formik.handleChange}
              value={formik.values.start}
            />

            <label htmlFor="end">Till</label>
            <input
              id="end"
              name="end"
              type="date"
              min={formik.values.start}
              onChange={formik.handleChange}
              value={formik.values.end}
            />

            <button type="submit" disabled={loading}>
              Hämta!
            </button>
          </form>
        )}
      </Formik>
      {loading && (
        <div>
          <p>Det här kan ta en stund ...</p>
          <img src="https://media3.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy.gif" />
        </div>
      )}
      {lessons && (
        <p>
          <strong>Hittade {lessons.length} händelser.</strong>
        </p>
      )}
      {url && (
        <a href={url} download="kalender.ical">
          Tryck här för att spara kalendern
        </a>
      )}
      {url && (
        <>
          <p>Så importerar du schemat till din kalender:</p>
          <ul>
            <li>
              <a href="https://support.apple.com/sv-se/guide/calendar/icl1023/mac">
                Apples kalender
              </a>
            </li>
            <li>
              <a href="https://support.google.com/calendar/answer/37118">
                Google Kalender
              </a>
            </li>
          </ul>
        </>
      )}
    </>
  );
};

export default ScheduleSelector;

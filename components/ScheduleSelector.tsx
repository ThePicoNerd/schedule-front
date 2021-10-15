import { DateTime } from "luxon";
import { FunctionComponent, useContext } from "react";
import useSWR from "swr";
import { Context } from "./context";

interface Lesson {
  start: string;
  end: string;
  course: string;
  location: string;
  teacher: string;
}

async function fetchLessons(date: DateTime, token: string): Promise<Lesson[]> {
  const res = await fetch(
    `http://localhost:8000/lessons?year=${date.weekYear}&week=${date.weekNumber}`,
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

const ScheduleSelector: FunctionComponent = () => {
  const { token } = useContext(Context);
  const { data } = useSWR("/lessons", () =>
    fetchLessons(DateTime.now(), token)
  );

  return (
    <ul>
      {data?.map(({ start, course }) => (
        <li key={start}>{course}</li>
      ))}
    </ul>
  );
};

export default ScheduleSelector;

import { CalendarView } from "@/components/calendar/calendar-view";

export function Calendar() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold">Calendario</h1>
           <p className="text-muted-foreground">Visualiza y organiza tus tareas en el tiempo</p>
        </div>
      </div>
      <div className="flex-1 border rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
         <CalendarView />
      </div>
    </div>
  );
}

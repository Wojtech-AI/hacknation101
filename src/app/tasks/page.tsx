"use client";
import { ProgressStepper, LabourMarketPanel, TaskCard, DisclaimerNote } from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";
import { useCountry } from "@/lib/useCountry";
import { generateTasks } from "@/lib/tasks";

export default function TasksPage() {
  const { config } = useCountry();
  const tasks = generateTasks(config);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={6} />
      </div>

      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="section-label">Step 05 · Fair Work Task Hub</p>
          <CountrySwitcher />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Task Hub</h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-xl">
          These simulated AI evaluation tasks are matched to your Signal Profile. Unmapped Voices does not optimise
          for cheapest labour. It filters tasks by fairness, safety, transparency, and progression value.
        </p>
      </section>

      {/* Labour market panel */}
      <LabourMarketPanel config={config} />

      {/* Tasks */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} showBreakdown />
        ))}
      </div>

      <DisclaimerNote />
    </div>
  );
}

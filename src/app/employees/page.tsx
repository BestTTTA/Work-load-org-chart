import { Suspense } from "react";
import { EmployeeForm } from "@/components/employee-form";
import { EmployeeRow } from "@/components/employee-row";
import { PageSkeleton } from "@/components/page-skeleton";
import { createEmployee } from "@/lib/actions";
import { readDb } from "@/lib/db";
import { projectsOf, sortEmployees, uniqueValues } from "@/lib/workload";

export default function EmployeesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">พนักงาน</h1>
      <Suspense fallback={<PageSkeleton />}>
        <Employees />
      </Suspense>
    </div>
  );
}

async function Employees() {
  const db = await readDb();
  const departments = uniqueValues(db.employees.map((item) => item.department));
  const roles = uniqueValues(db.employees.map((item) => item.role));

  return (
    <>
      <section className="rounded-lg border border-line bg-surface p-4">
        <EmployeeForm
          action={createEmployee}
          departments={departments}
          roles={roles}
          submitLabel="เพิ่มพนักงาน"
        />
      </section>
      {db.employees.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          ยังไม่มีพนักงาน กรอกฟอร์มด้านบนเพื่อเพิ่มคนแรก
        </p>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  ชื่อเล่น
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  สังกัด
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  บทบาท
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  โปรเจค
                </th>
                <th scope="col" className="px-3 py-2">
                  <span className="sr-only">จัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortEmployees(db.employees).map((employee) => (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                  projects={projectsOf(db, employee.id)}
                  departments={departments}
                  roles={roles}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

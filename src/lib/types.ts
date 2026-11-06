export type Employee = {
  id: string;
  nickname: string;
  department: string;
  role: string;
};

export type Project = {
  id: string;
  name: string;
  memberIds: string[];
};

export type Db = {
  employees: Employee[];
  projects: Project[];
};

export type ActionResult = { ok: true } | { ok: false; error: string };

export type EmployeeFormState = ActionResult & {
  values?: Omit<Employee, "id">;
};

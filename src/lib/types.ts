export interface Project {
  id: string
  userId: string
  name: string
  color: string
  archived: boolean
  createdAt: number
}

export interface TimeEntry {
  id: string
  userId: string
  projectId: string
  start: number
  end: number | null
  createdAt: number
}

export type NewProject = Pick<Project, 'name' | 'color'>
export type NewTimeEntry = Pick<TimeEntry, 'projectId' | 'start' | 'end'>

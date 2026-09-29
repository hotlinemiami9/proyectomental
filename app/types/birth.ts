export interface BirthFormData {
  name: string
  date: string
  time: string
  city: string
  country: string
}

export interface BirthExample {
  id: string
  label: string
  year: string
  data: BirthFormData
}

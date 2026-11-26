// The site's name and the compute it offers notebooks, as the notebook and
// compute pages say them (from LabBooks' brand.js).
export const BRAND = {
  name: 'Epilepsy.Science',
  // Where "Talk to the Pennsieve team" goes: Pennsieve's office hours.
  contactUrl: 'https://docs.pennsieve.io/docs/pennsieve-office-hours',
}

// What the Pennsieve Shared Compute Node offers.
export const SHARED_NODE = {
  // Notebook time per user per day.
  hoursPerDay: 1,
  notebooks: 1,
  // The sizes it takes (the SIZES keys in plugins/notebooks.client.js).
  sizes: ['small', 'medium'],
  summary: 'Free · 1 hour of notebook time per day · 1 notebook at a time',
  limits: ['Free to use', '1 hour of notebook time per day', '1 notebook at a time', 'Up to 2 vCPU and 4 GB, CPU only'],
}

// What a basic node of the visitor's own costs while nothing runs: about
// $1-2 a month (a KMS key, logs, small tables), said as an upper bound.
export const OWN_NODE_IDLE = 'Less than $5 a month when idle'

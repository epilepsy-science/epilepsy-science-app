// Offline fixtures used by plugins/contentful.js when CTF_SPACE_ID is not set,
// so the UI can be developed without Contentful credentials.
const project = (id, fields, mockStats) => ({
  sys: { id },
  fields: { collectionIds: [], ...fields, mockStats },
})

export const mockProjects = [
  project(
    '1edCdvk6pOe8z3VZaiUcar',
    {
      name: 'Penn Epilepsy Center iEEG Cohort',
      projectId: 'pennepi',
      summary:
        'Intracranial EEG recordings, imaging, and clinical outcomes from patients undergoing epilepsy surgery evaluation at the Hospital of the University of Pennsylvania.',
      description: 'A curated, harmonized cohort of **intracranial EEG** recordings with clinical metadata.',
      investigators: ['Brian Litt', 'Kathryn Davis', 'Joost Wagenaar'],
      funding: ['NIH NINDS'],
    },
    { datasets: 142, size: 4.2e12, patients: 1288, recordings: 3471, modalities: ['iEEG', 'MRI', 'CT'], dashboard: true },
  ),
  project(
    'mock-ieeg-portal',
    {
      name: 'International Epilepsy Electrophysiology Portal',
      projectId: 'ieeg-portal',
      summary:
        'A community archive of long-term EEG recordings shared across institutions to support seizure detection and prediction research.',
      investigators: ['Gregory Worrell', 'Brian Litt'],
      funding: ['NIH NINDS', 'Mayo Clinic'],
    },
    { datasets: 98, size: 2.1e12, modalities: ['iEEG', 'EEG'] },
  ),
  project(
    'mock-seizure-models',
    {
      name: 'Computational Models of Seizure Dynamics',
      projectId: 'seizure-models',
      summary:
        'Simulation outputs and fitted network models describing seizure onset and propagation in focal epilepsy.',
      investigators: ['Viktor Jirsa'],
      funding: ['EU Horizon'],
    },
    { datasets: 21, size: 3.4e10, modalities: ['Models'] },
  ),
  project(
    'mock-pediatric',
    {
      name: 'Pediatric Epilepsy Surgery Outcomes',
      projectId: 'pedepi',
      summary:
        'Longitudinal outcomes, imaging and neurophysiology for children evaluated for epilepsy surgery.',
      investigators: ['Nicholas Gaspard', 'Eun-Hyoung Park'],
      funding: ['CURE Epilepsy'],
    },
    { datasets: 37, size: 8.8e11, modalities: ['EEG', 'MRI'] },
  ),
  project(
    '7az5mLrFGF1F8TPQ12uhCa', // matches the existing Contentful entry
    {
      name: 'Brain Data Science Platform Project',
      projectId: 'bdsp-open',
      summary:
        'Open-access EEG and sleep datasets from the Brain Data Science Platform, a shared repository from Stanford Medicine, Harvard Medical School, Massachusetts General Hospital and Beth Israel Deaconess Medical Center.',
      description:
        'The **Brain Data Science Platform (BDSP)** is a repository of freely available brain research data created by the Clinical Data Animation Center at Stanford Medicine. This project collects the open-access tier of BDSP, published through the [AWS Open Data Registry](https://registry.opendata.aws/bdsp_open_projects/).\n\nEach dataset is hosted by BDSP and is linked here with its DOI, license and source repository. BDSP also maintains larger credentialed collections, including the Harvard EEG Database and the Human Sleep Project, that require registration and a data use agreement on [bdsp.io](https://bdsp.io).',
      investigators: ['M. Brandon Westover', 'Haoqi Sun', 'Jin Jing'],
      funding: ['NIH NINDS', 'NIH NIA', 'American Academy of Sleep Medicine Foundation'],
      website: 'https://bdsp.io',
      hostedBy: 'Brain Data Science Platform',
      dataAccess:
        'Datasets are hosted by BDSP, not on Epilepsy.Science. Open-access datasets need no registration. Files on the BDSP S3 access point require a one-time access request through bdsp.io.',
      externalDatasets: [
        {
          id: 'bdsp-hypothermia',
          name: 'The Human Burst Suppression Electroencephalogram of Deep Hypothermia',
          description:
            'Continuous EEG recorded from 11 patients during deep hypothermic circulatory arrest in cardiac surgery, with burst detection outputs, spectra and MATLAB analysis code. Accompanies a 2015 Clinical Neurophysiology paper on cooling-induced burst suppression.',
          authors: ['M. Brandon Westover', 'Aditya Gupta', 'Manohar Ghanta', 'Valdery Moura Junior'],
          version: '1.0',
          publishedYear: 2023,
          doi: '10.60508/gf89-y383',
          license: 'CC BY-SA 4.0',
          modalities: ['EEG'],
          subjects: 11,
          formats: ['MAT', 'PDF', 'PNG'],
          accessTier: 'open',
          hasRawSignal: true,
          links: {
            landing: 'https://bdsp.io/content/dhypothermia/',
            code: 'https://github.com/bdsp-core/Hypothermia-EEG',
            s3: 'arn:aws:s3:us-east-1:184438910517:accesspoint/bdsp-open-access-point/',
          },
        },
        {
          id: 'bdsp-sleep-outcomes',
          name: 'Assessing Risk of Health Outcomes From Brain Activity in Sleep',
          description:
            'Sleep EEG features (band power, spindle characteristics, slow oscillations and spindle-slow oscillation coupling) for 8,672 Massachusetts General Hospital patients, linked to ten-year neurologic, cardiovascular, psychiatric and mortality outcomes. Includes a risk calculator for new polysomnography recordings.',
          authors: ['Haoqi Sun', 'Noor Adra', 'Wolfgang Ganglberger', 'M. Brandon Westover', 'Robert Thomas'],
          version: '1.1',
          publishedYear: 2025,
          doi: '10.60508/tk6p-b757',
          license: 'ODC-By 1.0',
          modalities: ['Sleep EEG', 'PSG'],
          subjects: 8672,
          formats: ['CSV'],
          accessTier: 'open',
          hasRawSignal: false,
          links: {
            landing: 'https://bdsp.io/content/rhofbas/',
            code: 'https://github.com/bdsp-core/sleep-outcome-prediction',
            s3: 'arn:aws:s3:us-east-1:184438910517:accesspoint/bdsp-open-access-point/',
          },
        },
        {
          id: 'bdsp-ve-cam-s',
          name: 'VE-CAM-S: Visual EEG-Based Grading of Delirium Severity',
          description:
            'Derived EEG features, model coefficients and cross-validated predictions from a prospective cohort of 404 adult inpatients, used to build a physiological severity scale for delirium and coma secondary to acute encephalopathy.',
          authors: ['Ryan Tesh', 'Haoqi Sun', 'Jin Jing', 'Eyal Kimchi', 'M. Brandon Westover'],
          version: '1.0',
          publishedYear: 2024,
          doi: '10.60508/jfpq-mj80',
          license: 'ODbL 1.0',
          modalities: ['EEG'],
          subjects: 404,
          formats: ['CSV', 'XLSX', 'Pickle'],
          accessTier: 'open',
          hasRawSignal: false,
          links: {
            landing: 'https://bdsp.io/content/ve-cam-s/',
            code: 'https://github.com/bdsp-core/VE-CAM-S',
            s3: 'arn:aws:s3:us-east-1:184438910517:accesspoint/bdsp-open-access-point/',
          },
        },
        {
          id: 'bdsp-spike-trial',
          name: 'Interictal Epileptiform Discharge Identification: Educational Pilot Trial',
          description:
            'Pre- and post-training assessments from a randomized trial of 21 neurology residents rating 500 candidate EEG segments for interictal epileptiform discharges, drawn from 13,262 expert-labeled waveforms. Compares web and iOS feedback training against controls.',
          authors: ['Fabio Nascimento', 'Jin Jing', 'Jeremy Moeller', 'M. Brandon Westover'],
          version: '1.0',
          publishedYear: 2025,
          doi: '10.60508/zh41-gs70',
          license: 'ODC-By 1.0',
          modalities: ['EEG'],
          subjects: 21,
          formats: ['CSV'],
          accessTier: 'open',
          hasRawSignal: false,
          links: {
            landing: 'https://bdsp.io/content/hd16tgxar93xb7e253pr/',
            code: 'https://github.com/bdsp-core/spike-test-pilot-trial',
          },
        },
      ],
    },
    { datasets: 4, size: null, modalities: ['EEG', 'Sleep EEG', 'PSG'] },
  ),
]

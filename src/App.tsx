/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { OfficialCorrespondence } from './pages/OfficialCorrespondence';
import { AdminPortal } from './pages/AdminPortal';
import { GenericPage } from './pages/GenericPage';
import { Agents } from './pages/Agents';
import { DocumentSubmissionForm } from './pages/DocumentSubmissionForm';
import { DocumentSubmissionReport } from './pages/DocumentSubmissionReport';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="correspondence" element={<OfficialCorrespondence />} />
          <Route path="branches" element={<GenericPage title="Branch Offices" description="Directory and details of all branch offices connected to Dhenkanal RS SO." />} />
          <Route path="customers" element={<GenericPage title="Our Customers" description="Customer database, analytics, and contact information management." />} />
          <Route path="agents" element={<Agents />} />
          <Route path="others" element={<GenericPage title="Others" description="Miscellaneous resources, guidelines, and additional staff links." />} />
          <Route path="admin" element={<AdminPortal />} />
          <Route path="doc-submission" element={<DocumentSubmissionForm />} />
          <Route path="doc-report" element={<DocumentSubmissionReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

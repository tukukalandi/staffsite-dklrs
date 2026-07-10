export interface DocumentSubmission {
  id?: string;
  accountNo: string;
  customerName: string;
  documentType: string;
  otherType?: string;
  entryDate: string;
  submissionDate: string;
  submittedTo: string;
  otherOffice?: string;
  remarks?: string;
  status: 'Pending' | 'Received' | 'Completed' | 'Rejected' | 'Returned';
  submittedBy: string;
  createdAt: any;
  updatedAt: any;
}

import PersonCard from '../PersonCard';

export default function PersonCardExample() {
  //todo: remove mock functionality
  const mockJobs = [
    { id: '1', title: 'Website Development', status: 'completed', clientName: 'Acme Corp' },
    { id: '2', title: 'Database Migration', status: 'in-progress', clientName: 'Tech Solutions' },
    { id: '3', title: 'UI Design', status: 'pending', clientName: 'StartupXYZ' },
  ];

  return (
    <div className="max-w-md">
      <PersonCard
        id="example-1"
        name="John Smith"
        email="john.smith@example.com"
        telephone="+1 (555) 123-4567"
        address="123 Main Street, Anytown, NY 12345"
        jobs={mockJobs}
        onEdit={() => console.log('Edit person triggered')}
        onDelete={() => console.log('Delete person triggered')}
        onViewJobs={() => console.log('View jobs triggered')}
      />
    </div>
  );
}
import PersonListView from '../PersonListView';

export default function PersonListViewExample() {
  //todo: remove mock functionality
  const mockPeople = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      telephone: '+1 (555) 123-4567',
      address: '123 Main Street, Anytown, NY 12345',
      jobs: [
        { id: '1', title: 'Website Development', status: 'completed', clientName: 'Acme Corp' },
        { id: '2', title: 'Database Migration', status: 'in-progress', clientName: 'Tech Solutions' },
      ]
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      telephone: '+1 (555) 987-6543',
      address: '456 Oak Avenue, Springfield, CA 90210',
      jobs: [
        { id: '3', title: 'UI Design', status: 'pending', clientName: 'StartupXYZ' },
      ]
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      telephone: '+1 (555) 456-7890',
      address: '789 Pine Street, Riverside, TX 75001',
      jobs: []
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      telephone: '+1 (555) 321-0987',
      address: '321 Elm Drive, Lakewood, FL 33801',
      jobs: [
        { id: '4', title: 'Mobile App Development', status: 'completed', clientName: 'Digital Agency' },
        { id: '5', title: 'System Integration', status: 'in-progress', clientName: 'Enterprise Solutions' },
        { id: '6', title: 'API Development', status: 'pending', clientName: 'Cloud Services' },
      ]
    }
  ];

  return (
    <div className="p-4">
      <PersonListView
        people={mockPeople}
        onEditPerson={(person) => console.log('Edit person triggered:', person)}
        onDeletePerson={(id) => console.log('Delete person triggered:', id)}
        onViewJobs={(id) => console.log('View jobs triggered for person:', id)}
      />
    </div>
  );
}
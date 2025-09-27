import PersonForm from '../PersonForm';

export default function PersonFormExample() {
  //todo: remove mock functionality
  const mockPerson = {
    id: 'example-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    telephone: '+1 (555) 123-4567',
    address: '123 Main Street, Anytown, NY 12345'
  };

  return (
    <div className="p-4">
      <PersonForm
        person={mockPerson}
        isEditing={true}
        onSave={(data) => console.log('Person form saved:', data)}
        onCancel={() => console.log('Person form cancelled')}
      />
    </div>
  );
}
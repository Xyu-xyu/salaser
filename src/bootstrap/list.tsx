import ListGroup from 'react-bootstrap/ListGroup';

function List() {
  return (
    <ListGroup style={{ backgroundColor: '#343a40', color: '#ffffff' }}>
      <ListGroup.Item style={{ backgroundColor: '#495057', color: '#ffffff' }}>
        No style
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#007bff', color: '#ffffff' }} variant="primary">
        Primary
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#6c757d', color: '#ffffff' }} action variant="secondary">
        Secondary
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#28a745', color: '#ffffff' }} action variant="success">
        Success
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#dc3545', color: '#ffffff' }} action variant="danger">
        Danger
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#ffc107', color: '#212529' }} action variant="warning">
        Warning
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#17a2b8', color: '#ffffff' }} action variant="info">
        Info
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#f8f9fa', color: '#212529' }} action variant="light">
        Light
      </ListGroup.Item>
      <ListGroup.Item style={{ backgroundColor: '#343a40', color: '#ffffff' }} action variant="dark">
        Dark
      </ListGroup.Item>
    </ListGroup>
  );
}

export default List;
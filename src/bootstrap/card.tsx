import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';

function CardExample() {
  return (
    <div className="d-flex justify-content-around" style={{ backgroundColor: '#343a40', padding: '20px' }}>
      <Card style={{ width: '18rem', backgroundColor: '#495057', color: '#ffffff' }}>
        
        <Card.Body>
          <Card.Title style={{ color: '#ffffff' }}>Card Title</Card.Title>
          <Card.Text style={{ color: '#ffffff' }}>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
          <Button variant="light">Go somewhere</Button>
        </Card.Body>
      </Card>

      <Card style={{ width: '18rem', backgroundColor: '#495057', color: '#ffffff' }}>
        
        <Card.Body>
          <Placeholder as={Card.Title} animation="glow" style={{ color: '#ffffff' }}>
            <Placeholder xs={6} />
          </Placeholder>
          <Placeholder as={Card.Text} animation="glow" style={{ color: '#ffffff' }}>
            <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
            <Placeholder xs={6} /> <Placeholder xs={8} />
          </Placeholder>
          <Placeholder.Button variant="dark" xs={6} />
        </Card.Body>
      </Card>
    </div>
  );
}

export default CardExample;
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';


function BasicTabs() {
  return (
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3 mt-4"
      fill
    >
      <Tab eventKey="home" title="Home">
        <ButtonGroup size="lg" className="mb-2">
          <Button>Left</Button>
          <Button>Middle</Button>
          <Button>Right</Button>
        </ButtonGroup>
      </Tab>
      <Tab eventKey="profile" title="Profile">
        <ButtonGroup size="lg" className="mb-2">
          <Button>Left</Button>
          <Button>Middle</Button>
          <Button>Right</Button>
        </ButtonGroup>
      </Tab>
      <Tab eventKey="longer-tab" title="Loooonger Tab">
        <ButtonGroup size="lg" className="mb-2">
            <Button className="btn-warning">Left</Button>
            <Button className="btn-warning">Middle</Button>
            <Button className="btn-warning">Right</Button>
          </ButtonGroup>
      </Tab>
      <Tab eventKey="contact" title="Contact">
        <ButtonGroup size="lg" className="mb-2">
          <Button className="btn-danger">Left</Button>
          <Button className="btn-danger">Middle</Button>
          <Button className="btn-danger">Right</Button>
        </ButtonGroup>
      </Tab>
    </Tabs>
  );
}

export default BasicTabs;
import React, { useContext } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';

const PINK = 'rgba(255, 192, 203, 0.6)';
const BLUE = 'rgba(0, 0, 255, 0.6)';

interface ContextAwareToggleProps {
  children: React.ReactNode;
  eventKey: string; 
  callback?: (eventKey: string) => void; 
}

const ContextAwareToggle: React.FC<ContextAwareToggleProps> = ({ children, eventKey, callback }) => {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <button
      type="button"
      style={{ backgroundColor: isCurrentEventKey ? PINK : BLUE }}
      onClick={decoratedOnClick}
    >
      {children}
    </button>
  );
};

const Example = () => {
  return (
    <Accordion defaultActiveKey="0" data-bs-theme="dark">
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((a) => (
      <Card key={a}>
        <Card.Header>
          <ContextAwareToggle eventKey={String(a)}>Click me!</ContextAwareToggle>
        </Card.Header>
        <Accordion.Collapse eventKey={String(a)}>
          <>
            {Array.from({ length: a + 1 }).map((_, i) => (
              <Card.Body key={i}>Params {i} value : {i**2}</Card.Body>
            ))}
          </>
        </Accordion.Collapse>
      </Card>
    ))}
  </Accordion>
  
  );
};

export default Example;
import React, { useState } from 'react';
import { Button, Card, ProgressBar } from 'react-bootstrap';

const steps = [
  { title: 'Шаг 1', content: 'Это содержимое шага 1' },
  { title: 'Шаг 2', content: 'Это содержимое шага 2' },
  { title: 'Шаг 3', content: 'Это содержимое шага 3' },
  { title: 'Шаг 1', content: 'Это содержимое шага 1' },
  { title: 'Шаг 2', content: 'Это содержимое шага 2' },
  { title: 'Шаг 3', content: 'Это содержимое шага 3' },
  { title: 'Шаг 1', content: 'Это содержимое шага 1' },
  { title: 'Шаг 2', content: 'Это содержимое шага 2' },
  { title: 'Шаг 3', content: 'Это содержимое шага 3' },
];

const Stepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Stepper на React-Bootstrap</h3>

      <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mb-4" />

      <Card className="mb-4">
        <Card.Header>{steps[currentStep].title}</Card.Header>
        <Card.Body>
          <Card.Text>{steps[currentStep].content}</Card.Text>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={handlePrev} disabled={currentStep === 0}>
          Назад
        </Button>
        <Button variant="primary" onClick={handleNext} disabled={currentStep === steps.length - 1}>
          Далее
        </Button>
      </div>
    </div>
  );
};

export default Stepper;

import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { SwiperPiercingMacroCharts } from './swiperPiercingMacroCharts';

const tabNames = ['Высота', 'Фокус', 'Мощность', 'Давление'];

export const SwiperPiercingMacroTabs: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('Высота');

  return (
    <div className='mt-4 mx-2'>
	<Tabs
      id="dynamic-tabs"
      activeKey={activeKey}
      onSelect={(k) => k && setActiveKey(k)}
      className="mb-3"
    >
      {tabNames.map((name) => (
        <Tab eventKey={name} title={name} key={name}>
  			<div style={{ width: '600px', margin: 'auto' }}>
				<SwiperPiercingMacroCharts />
			</div>
			
        </Tab>
      ))}
    </Tabs>

	</div>
	  );
};

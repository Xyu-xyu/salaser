import { observer } from "mobx-react-lite";
import { Icon } from '@iconify/react';
import { ListGroup, Form } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
 import laserStore from "../store/laserStore";



const RightBar = observer(() => {

	const { rightMode } = laserStore
	const { i18n } = useTranslation();
	const { t } = useTranslation()
	const languages = [
		{ lang: 'ru', name: 'Русский' },
		{ lang: 'en', name: 'English' }
	]

	return (

		<div id="RightBar" className={`d-flex flex-column ${rightMode ? "visible" : "d-none"}`}>
			<div>
				<div className="mt-2">
					<h5>{t('Plans')}</h5>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fluent:copy-add-20-regular"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Add')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fluent:tab-new-24-filled"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('New')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fluent-mdl2:remove-from-trash"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Tidy up')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fluent:group-24-regular"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Group')}</div>
						</div>
					</button>
				</div>
				<div className="mt-2">
					<h5>{t('Plan')}</h5>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="tabler:chart-dots-3"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Parameters')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="ph:function"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Functions')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fluent:clipboard-more-20-regular"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Details')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fluent:edit-24-regular"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Edit')}</div>
						</div>
					</button>
				</div>
				<div className="mt-2">
					<h5>{t('View')}</h5>
				</div>
				<div className="dropdown">
					<button
						className="btn dropdown-toggle w-100 d-flex align-items-center"
						type="button"
						data-bs-toggle="dropdown"
						aria-expanded="false">
						<Icon icon="fluent-mdl2:world" width="24" height="24" style={{ 'color': 'black' }} />
						<div className="flex-grow-1 text-center">{t('Select language')}</div>
					</button>
					<ul className="dropdown-menu w-100 m-0" style={{ 'border': 'none' }}>
						<ListGroup style={{ 'border': 'none' }}>
							{languages.map((option) => (
								<ListGroup.Item key={option.lang} >
									<Form.Check
										type="radio"
										id={`radio-${option.lang}`}
										label={option.name}
										name={`${option.lang}-Options-${'lang'}`}
										value={option.name}
										checked={option.lang === i18n.language}
										onChange={() => i18n.changeLanguage(option.lang)}
									/>
								</ListGroup.Item>
							))}
						</ListGroup>
					</ul>
				</div>
			</div>
		</div>
	)
});

export default RightBar;

import { observer } from "mobx-react-lite";
import { Icon } from '@iconify/react';
import { ListGroup, Form } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import laserStore from "../store/laserStore";
import { UploadButton } from "./uploadButton";



const RightBar = observer(() => {

	const { carouselInPlan, rightMode } = laserStore
	const { i18n } = useTranslation();
	const { t } = useTranslation()
	const languages = [
		{ lang: 'ru', name: 'Русский' },
		{ lang: 'en', name: 'English' }
	]

	return (

		<div id="RightBar" className={`d-flex flex-column ${rightMode ? "visible" : "d-none"}`}>
			{ carouselInPlan && <div>
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
				<div className="mt-4">
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
				<div className="mt-4">
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
										style={{margin:0}}
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
			</div>}
			{ !carouselInPlan && <div>
				 <div className="mt-2">
					<h5>{t('Parameters')}</h5>
				</div>
				<div>
					<UploadButton />
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fa7-solid:list-check"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Select')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="fa7-solid:list-check"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Edit')}</div>
						</div>
					</button>
				</div>

				<div>
					<button className="w-100 disabled" disabled>
						<div className="d-flex align-items-center">
							<Icon icon="fa7-solid:list-check"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Wizard')}</div>
						</div>
					</button>
				</div>

				<div className="mt-4">
					<h5>{t('Functions')}</h5>
				</div>


				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="hugeicons:function"
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
							<Icon icon="solar:restart-bold"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Restart')}</div>
						</div>
					</button>
				</div>


				<div className="mt-4">
					<h5>{t('Display')}</h5>
				</div>

				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="tabler:chart-dots-3"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('Display')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="carbon:view"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />

							<div className="flex-grow-1 text-center">{t('View')}</div>
						</div>
					</button>
				</div>
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon icon="flowbite:clipboard-list-outline"
								width="24"
								height="24"
								style={{ color: 'black' }}
								className='ms-1' />
							<div className="flex-grow-1 text-center">{t('Key')}</div>
						</div>
					</button>
				</div>
			</div>}
		</div>
	)
});

export default RightBar;

import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { showToast } from "../toast";
import { useTranslation } from "react-i18next";

// Интерфейс для одного пункта меню
interface MenuItem {
  icon: string;
  onClick: () => void;
  text: string;
}

// Интерфейс для секции меню
interface MenuSectionData {
  title: string;
  items: MenuItem[];
}

// Главный компонент
const FavoritesButton: React.FC = observer(() => {
  // const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(true);
  const handleClose = (): void => setShow(false);
  const showModal = (): void => setShow(true);
  const { t } = useTranslation()

  /** Обработчик нажатия на кнопку меню */
  const handleClick = (label: string): void => {
    console.log(`Clicked on ${label}`);
	showToast({
		type: 'success',
		message: `Clicked on ${label}`,
		position: 'bottom-right',
		autoClose: 2500
	});
  };

  /** Данные для меню */
  const menuData: Record<string, MenuItem[]> = {
    "Cutting head": [
      { icon: "carbon:calibrate", onClick: () => handleClick("Calibrate"), text: "Calibrate" },
      { icon: "solar:wind-outline", onClick: () => handleClick("Clean"), text: "Clean" },
    ],
    "Shuttle table": [
      { icon: "fluent:hand-left-16-regular", onClick: () => handleClick("Manual operation"), text: "Manual operation" },
      { icon: "icon-park:switch-contrast", onClick: () => handleClick("Switch"), text: "Switch" },
      { icon: "mdi:truck", onClick: () => handleClick("Move aside"), text: "Move aside" },
    ],
    Machine: [
      { icon: "fluent:hand-left-16-regular", onClick: () => handleClick("Manual operation"), text: "Manual operation" },
      { icon: "fluent:wrench-screwdriver-24-regular", onClick: () => handleClick("Service"), text: "Service" },
      { icon: "lucide:square-parking", onClick: () => handleClick("Park"), text: "Park" },
      { icon: "mdi:map-marker", onClick: () => handleClick("Move to reference"), text: "Move to reference" },
      { icon: "mdi:target", onClick: () => handleClick("Shift origin"), text: "Shift origin" },
      { icon: "wpf:cut-paper", onClick: () => handleClick("Separation cut"), text: "Separation cut" },
      { icon: "solar:heart-pulse-linear", onClick: () => handleClick("Test"), text: "Test" },
    ],
  };

  /** Компонент кнопки меню */
	const MenuButton: React.FC<MenuItem> = ({ icon, onClick, text }) => (
		<div>
			<button className="w-100 m-1" onClick={onClick}>
				<div className="d-flex align-items-center justify-content-center">
					<Icon
						icon={icon}
						width="36"
						height="36"
						style={{ color: "black" }} 
						className="ms-2"/>
					<div className="flex-grow-1 text-center">
						<h6 className="m-0 p-0">{t(text)}</h6>
					</div>
				</div>
			</button>
		</div>
	);


  /** Компонент секции меню */
  const MenuSection: React.FC<MenuSectionData> = ({ title, items }) => (
    <div className="col-4 my-4 mx-1 d-flex flex-column">
      <div>
	  	<h4 className="ms-2 text-xs font-bold text-gray-500 uppercase mb-2">{t(title)}</h4>
	  </div>
      <div className="d-flex flex-column w-100">
        {items.map((item, index) => (
          <MenuButton key={index} icon={item.icon} onClick={item.onClick} text={item.text} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="ms-2">
      <button
        className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`}
        onClick={showModal}
      >
        <div className="d-flex align-items-center justify-content-center">
          <Icon
            icon="fluent:star-16-regular"
            width="36"
            height="36"
            style={{ color: show ? "white" : "black" }}
          />
        </div>
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        id="favoritesButtonModal"
        className="with-inner-backdrop powerButton-navbar-modal favoritesButton-navbar-modal"
        centered={false}
      >
        <div style={{ padding: ".25rem" }}>
          <div
            style={{
              minHeight: "calc(100vh * 0.5)",
              maxHeight: "calc(100vh * 0.75)",
              minWidth: "calc(100vw * 0.5)",
              overflowY: "auto",
              overflowX: "hidden",
            }}
            className="d-flex"
          >
            {Object.entries(menuData).map(([title, items]) => (
              <MenuSection key={title} title={title} items={items} />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default FavoritesButton;

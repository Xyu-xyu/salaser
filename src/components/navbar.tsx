import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../store/viewStore";


const NavBar = observer(() => {

    const { knobMode } = viewStore
    const handleClick = () => {
        //console.log ("   пиу  ")
        viewStore.setKnobMode(!knobMode);
    };

    return (
        <div>
            <div id="NavBar" className="w-100">
                <div className="ms-2">
                    <button className="violet_button navbar_button">
                        <div className="d-flex justify-content-center">
                            <Icon icon="fluent:circle-12-regular"
                                width="36"
                                height="36"
                                style={{ color: 'white' }}
                            />
                        </div>
                    </button>
                </div>
                <div className="ms-2">
                    <button className="grey_button navbar_button">
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="fluent:circle-12-regular"
                                width="36"
                                height="36"
                                style={{ color: 'black' }}
                            />
                        </div>
                    </button>
                </div>
                <div className="ms-2">
                    <button className="grey_button navbar_button">
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="material-symbols:cancel-outline"
                                width="36"
                                height="36"
                                style={{ color: 'black' }}
                            />
                        </div>
                    </button>
                </div>

                {/* LONG button start */}
                <div className="ms-4 w-100" id='longButton'>
                    <h5 className="m-0">Produce</h5>
                </div>

                {/* LONG button end */}

                <div className="ms-2">
                    <button className="grey_button navbar_button">
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="fluent:play-circle-28-regular"
                                width="36"
                                height="36"
                                style={{ color: 'black' }}
                            />
                        </div>
                    </button>
                </div>
                <div className="ms-2">
                    <button className="grey_button navbar_button" onPointerDown={handleClick}>
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="fluent:wrench-16-regular"
                                width="36"
                                height="36"
                                style={{ color: 'red' }}
                            />
                        </div>
                    </button>
                </div>
                <div className="ms-2">
                    <button className="grey_button navbar_button">
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="fluent:laser-tool-20-filled"
                                width="36"
                                height="36"
                                style={{ color: 'red' }}
                            />
                        </div>
                    </button>
                </div>
                <div className="ms-2">
                    <button className="grey_button navbar_button">
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="ic:round-cancel"
                                width="36"
                                height="36"
                                style={{ color: 'red' }}
                            />
                        </div>
                    </button>
                </div>
                <div className="ms-2">
                    <button className="grey_button navbar_button">
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="fluent:star-16-regular"
                                width="36"
                                height="36"
                                style={{ color: 'black' }}
                            />
                        </div>
                    </button>
                </div>
                <div className="ms-2">
                    <button className="grey_button navbar_button me-1">
                        <div className="d-flex align-items-center justify-content-center">
                            <Icon icon="fluent:power-20-filled"
                                width="36"
                                height="36"
                                style={{ color: 'black' }}
                            />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
});

export default NavBar;
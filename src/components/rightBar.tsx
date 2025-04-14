import { Icon } from '@iconify/react';
const RightBar = () => {

    return (

        <div id="RightBar" className="d-flex flex-column">
            <div>
                <div className="mt-2">
                    <h5>Plans</h5>
                </div>
                <div>
                    <button className="w-100">
                        <div className="d-flex align-items-center">
                             <Icon icon="fluent:copy-add-20-regular" 
                                width="24" 
                                height="24" 
                                style={{ color: 'black' }}
                                className='ms-1' />

                             <div className="flex-grow-1 text-center">Add</div>
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

                             <div className="flex-grow-1 text-center">New</div>
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

                             <div className="flex-grow-1 text-center">Tidy up</div>
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

                             <div className="flex-grow-1 text-center">Group</div>
                        </div>
                    </button>
                </div>
                <div className="mt-2">
                    <h5>Plan</h5>
                </div>
                <div>
                    <button className="w-100">
                        <div className="d-flex align-items-center">
                             <Icon icon="tabler:chart-dots-3" 
                                width="24" 
                                height="24" 
                                style={{ color: 'black' }}
                                className='ms-1' />

                             <div className="flex-grow-1 text-center">Parameters</div>
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

                             <div className="flex-grow-1 text-center">Functions</div>
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

                             <div className="flex-grow-1 text-center">Details</div>
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

                             <div className="flex-grow-1 text-center">Edit</div>
                        </div>
                    </button>
                </div>
                <div className="mt-2">
                    <h5>View</h5>
                </div>
                <div  className="dropdown">
                    <button
                        className="btn dropdown-toggle w-100 d-flex align-items-center"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                         <div className="flex-grow-1 text-center">Carousel</div>
                    </button>
                    <ul className="dropdown-menu w-100 m-0">
                        <li className="m-2"><button className="dropdown-item" type="button">1</button></li>
                        <li className="m-2"><button className="dropdown-item" type="button">2</button></li>
                        <li className="m-2"><button className="dropdown-item" type="button">3</button></li>
                    </ul>
                </div>               
            </div>





        </div>
    )
};

export default RightBar;

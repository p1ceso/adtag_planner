// TEMPORARY TEST FILE - Simple modal test
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const ModalTest = () => {
    const [show, setShow] = useState(false);

    return (
        <div className="p-10">
            <button
                onClick={() => {
                    console.log('Button clicked, show =', !show);
                    setShow(!show);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
            >
                Toggle Test Modal
            </button>

            {show && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{
                        zIndex: 99999,
                        backgroundColor: 'rgba(255, 0, 0, 0.5)',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                >
                    <div
                        className="bg-white p-8 rounded-xl shadow-2xl"
                        style={{
                            position: 'relative',
                            zIndex: 100000,
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1rem'
                        }}
                    >
                        <h2 className="text-2xl font-bold mb-4">Test Modal</h2>
                        <p className="mb-4">If you can see this, createPortal is working!</p>
                        <button
                            onClick={() => setShow(false)}
                            className="px-4 py-2 bg-red-600 text-white rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <div className="mt-4 text-sm text-gray-600">
                Modal state: {show ? 'OPEN' : 'CLOSED'}
            </div>
        </div>
    );
};

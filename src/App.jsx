import { useState } from 'react';
import './App.css';
import { MusicCanvas } from './components/musicCanvas';
import { SlArrowRight } from "react-icons/sl";

export const App = () => {

    const [ fileContent, setFileContent ] = useState(null);
    const [ showCanvas, setshowCanvas ] = useState(false);
    const [ audioUrl, setAudioUrl ] = useState(null);
    const [ compression, setCompression ] = useState('raw');
    const [ dropDownContent, setDropDownContent ] = useState('');
    const [ visualization, setVisualization ] = useState('bars');

    const handleDrop = (event) => {

        event.preventDefault();

        const file = event.dataTransfer.files[0]

        const url = URL.createObjectURL(file);

        setshowCanvas(true);
        setAudioUrl(url)
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const resetCanvas = (event) => {

        event.preventDefault()

        setFileContent(null);
        setshowCanvas(false);
        setAudioUrl(null);

    } 

    const selectCompression = (option) => {
        setCompression(option);
    }

    const handleDropDownHover = (option) => {
        setDropDownContent(option)
    }

    const selectVisualization = (option) => {
        setVisualization(option);
    }


    return (
        <>

            <div className="paste-button">
                <button className="dropbtn">Parametros</button>
                <div className="dropdown-content">
                    <span 
                        onMouseEnter={() => {handleDropDownHover('visual')}}
                    >
                        Visual
                        <SlArrowRight style={{
                            position: 'absolute',
                            top: '12px',
                            right: '20px',
                        }}/>
                    </span>

                    {
                        dropDownContent === 'visual' && (
                            <div className="dropdown-content-v">
                                <a onClick={ () => {selectVisualization("bars")} }>Bars</a>
                                <a onClick={ () => {selectVisualization("circunference")} }>Circunference</a>
                            </div>
                        )
                    }

                    <span
                        onMouseEnter={() => {handleDropDownHover('compression')}}
                    >
                        Compression (bars)
                        <SlArrowRight style={{
                            position: 'absolute',
                            top: '12px',
                            right: '20px',
                        }}/>
                    </span>

                    {
                        dropDownContent === 'compression' && (
                            <div className="dropdown-content-v">
                                <a onClick={ () => {selectCompression("raw")} }>Raw</a>
                                <a onClick={ () => {selectCompression("chunk")} }>Chunk Compression</a>
                                <a onClick={ () => {selectCompression("log")} }> Logaritmic Compression (beta) </a>
                            </div>
                        )
                    }
                    
                </div>
            </div>

            <div id='container'>
                
                <main id='boxContainer' style={{display: showCanvas ? 'none' : 'flex'}}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >        
                    <p id='textContainer'>{fileContent ?? 'Arrastra un archivo de audio'}</p>
                </main>
                
                <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    
                        
                        {audioUrl && <MusicCanvas audioFile={audioUrl} compression={compression} visual={visualization}/>}
                    
                
                    
                </div>
            </div>

            <button id='resetButton'
                onClick={resetCanvas}
            >
            RESET
            </button>

        </>
    )
}

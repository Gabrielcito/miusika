import { useState } from 'react';
import './App.css';
import { MusicCanvas } from './components/musicCanvas';

export const App = () => {

    const [ fileContent, setFileContent ] = useState(null);
    const [ showCanvas, setshowCanvas ] = useState(false);
    const [ audioUrl, setAudioUrl ] = useState(null);
    const [ compression, setCompression ] = useState('raw');

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

    return (
        <>

            <div className="dropdown">
                <button className="dropbtn">Parametros</button>
                <div className="dropdown-content">
                    <a onClick={ () => {selectCompression("raw")} }>Raw</a>
                    <a onClick={ () => {selectCompression("chunk")} }>Chunk Compression</a>
                    <a onClick={ () => {selectCompression("log")} }> Logaritmic Compression</a>
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
                    { audioUrl && <MusicCanvas audioFile={audioUrl} compression={compression}/>}
                </div>
            </div>

            <button id='resetButton'
                onClick={resetCanvas}
            >
            reset
            </button>

        </>
    )
}

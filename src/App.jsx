import { useState, useRef } from 'react';
import './App.css';
import { MusicCanvas } from './components/musicCanvas';
import { useAudioAnalyzer } from './components/useAudioAnalyzer';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { IoRefresh, IoMusicalNotes } from 'react-icons/io5';

const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
};

export const App = () => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [compression, setCompression] = useState('raw');
    const [visualization, setVisualization] = useState('bars');
    const fileInputRef = useRef(null);

    const { analyserNode, bufferLength, isPlaying, duration, currentTime, togglePlay, setVolume, seek } =
        useAudioAnalyzer(audioUrl);

    const loadFile = (file) => {
        if (!file || !file.type.startsWith('audio/')) return;
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(file));
        setFileName(file.name.replace(/\.[^/.]+$/, ''));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        loadFile(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleFileInput = (e) => loadFile(e.target.files[0]);

    const reset = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setFileName('');
    };

    const visOptions = [
        { id: 'bars', label: 'Barras' },
        { id: 'circumference', label: 'Círculo' },
        { id: 'wave', label: 'Onda' },
    ];

    const compOptions = [
        { id: 'raw', label: 'Raw' },
        { id: 'chunk', label: 'Chunk' },
        { id: 'log', label: 'Log' },
    ];

    return (
        <div className="app">
            <header className="header">
                <div className="logo">
                    <IoMusicalNotes className="logo-icon" />
                    <span>Miusika</span>
                </div>

                <div className="header-controls">
                    <div className="tab-group">
                        {visOptions.map(({ id, label }) => (
                            <button
                                key={id}
                                className={`tab ${visualization === id ? 'active' : ''}`}
                                onClick={() => setVisualization(id)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {visualization === 'bars' && (
                        <div className="tab-group">
                            {compOptions.map(({ id, label }) => (
                                <button
                                    key={id}
                                    className={`tab small ${compression === id ? 'active' : ''}`}
                                    onClick={() => setCompression(id)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <main className="main">
                {!audioUrl ? (
                    <div
                        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <IoMusicalNotes className="drop-icon" />
                        <p className="drop-text">
                            {isDragging ? 'Suéltalo aquí' : 'Arrastra tu música aquí'}
                        </p>
                        <span className="drop-hint">MP3 · WAV · OGG · FLAC · M4A</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            style={{ display: 'none' }}
                            onChange={handleFileInput}
                        />
                    </div>
                ) : (
                    <div
                        className="canvas-wrapper"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <MusicCanvas
                            analyserNode={analyserNode}
                            bufferLength={bufferLength}
                            compression={compression}
                            visual={visualization}
                        />
                    </div>
                )}
            </main>

            {audioUrl && (
                <footer className="footer">
                    <div className="track-info">
                        <IoMusicalNotes className="track-icon" />
                        <span className="track-name" title={fileName}>{fileName}</span>
                    </div>

                    <div className="playback">
                        <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        <div className="seek">
                            <span className="time">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                className="seek-bar"
                                min="0"
                                max={duration || 0}
                                step="0.1"
                                value={currentTime}
                                onChange={(e) => seek(parseFloat(e.target.value))}
                            />
                            <span className="time">{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="footer-right">
                        <div className="volume">
                            <FaVolumeUp className="vol-icon" />
                            <input
                                type="range"
                                className="vol-bar"
                                min="0"
                                max="1"
                                step="0.01"
                                defaultValue="0.5"
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                            />
                        </div>
                        <button className="reset-btn" onClick={reset} aria-label="Nuevo archivo">
                            <IoRefresh />
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};

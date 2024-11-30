import React, { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { FaPencilAlt, FaEraser, FaUndo, FaRedo, FaTrash, FaSave, FaDownload, FaRegSquare, FaCircle, FaSlash, FaHome, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface DrawingData {
  x: number;
  y: number;
  color: string;
  thickness: number;
  tool: 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line';
  type: 'begin' | 'drawing' | 'end';
  startX?: number;
  startY?: number;
}

const WhiteboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 60px;
  background-color: #2d2d2d;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Toolbar = styled.div`
  position: fixed;
  top: 0;
  left: 60px;
  right: 0;
  height: 50px;
  background-color: #3e3e3e;
  display: flex;
  align-items: center;
  padding: 0 10px;
  z-index: 10;
`;

const CanvasContainer = styled.div`
  flex-grow: 1;
  position: relative;
`;

const ToolButton = styled.button<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? '#555' : 'transparent')};
  color: #fff;
  border: none;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  &:hover {
    background-color: #555;
  }
`;

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(5);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line'>('pencil');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth - 60; // Adjust for sidebar width
    canvas.height = window.innerHeight - 50; // Adjust for toolbar height

    const context = canvas.getContext('2d');
    if (!context) return;
    contextRef.current = context;

    // Set drawing defaults
    context.lineCap = 'round';

    // Initialize socket connection
    const socket = io('http://localhost:5000'); // Replace with your backend URL
    socketRef.current = socket;

    // Listen for drawing events from the server
    socket.on('draw', (data: DrawingData) => {
      drawOnCanvas(data, false);
    });

    socket.on('clear', () => {
      clearCanvas();
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const drawOnCanvas = (data: DrawingData, emit: boolean) => {
    const { x, y, color, thickness, tool, type, startX, startY } = data;
    const context = contextRef.current;
    if (!context) return;

    if (tool === 'pencil' || tool === 'eraser') {
      if (type === 'begin') {
        context.beginPath();
        context.moveTo(x, y);
      } else if (type === 'drawing') {
        context.lineTo(x, y);
        context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
        context.lineWidth = thickness;
        context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        context.stroke();
      } else if (type === 'end') {
        context.closePath();
        context.globalCompositeOperation = 'source-over';
        saveCanvasState();
      }
    } else if (tool === 'rectangle' || tool === 'circle' || tool === 'line') {
      if (type === 'end') {
        // Clear the current drawing
        context.putImageData(history[historyStep - 1], 0, 0);

        context.strokeStyle = color;
        context.lineWidth = thickness;
        context.globalCompositeOperation = 'source-over';

        if (tool === 'rectangle' && startX !== undefined && startY !== undefined) {
          context.strokeRect(startX, startY, x - startX, y - startY);
        } else if (tool === 'circle' && startX !== undefined && startY !== undefined) {
          const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
          context.beginPath();
          context.arc(startX, startY, radius, 0, 2 * Math.PI);
          context.stroke();
          context.closePath();
        } else if (tool === 'line' && startX !== undefined && startY !== undefined) {
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(x, y);
          context.stroke();
          context.closePath();
        }

        saveCanvasState();
      }
    }

    if (emit) {
      socketRef.current?.emit('draw', data);
    }
  };

  const saveCanvasState = () => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (context && canvas) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prevHistory) => [...prevHistory.slice(0, historyStep), imageData]);
      setHistoryStep((prevStep) => prevStep + 1);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setIsDrawing(true);
    setStartX(offsetX);
    setStartY(offsetY);

    if (tool === 'pencil' || tool === 'eraser') {
      drawOnCanvas(
        { x: offsetX, y: offsetY, color, thickness, tool, type: 'begin' },
        true
      );
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = event.nativeEvent;

    if (tool === 'pencil' || tool === 'eraser') {
      drawOnCanvas(
        { x: offsetX, y: offsetY, color, thickness, tool, type: 'drawing' },
        true
      );
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    setIsDrawing(false);
    const { offsetX, offsetY } = event.nativeEvent;

    drawOnCanvas(
      {
        x: offsetX,
        y: offsetY,
        color,
        thickness,
        tool,
        type: 'end',
        startX,
        startY,
      },
      true
    );
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (context && canvas) {
        context.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (context && canvas) {
        context.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const clearCanvas = () => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      setHistoryStep(0);
    }
  };

  const handleClear = () => {
    clearCanvas();
    socketRef.current?.emit('clear');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      // Implement saving to profile favorites via backend API
      saveToFavorites(dataURL);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'whiteboard.png';
      link.click();
    }
  };

  const saveToFavorites = async (imageDataURL: string) => {
    try {
      await fetch('/api/whiteboard/save-favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: imageDataURL }),
        credentials: 'include',
      });
      alert('Saved to favorites!');
    } catch (error) {
      console.error('Error saving to favorites:', error);
    }
  };

  const handleToolChange = (selectedTool: 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line') => {
    setTool(selectedTool);
  };

  const navigate = useNavigate();

  return (
    <WhiteboardContainer>
      {/* Left Sidebar */}
      <Sidebar>
        <ToolButton onClick={() => handleToolChange('pencil')} active={tool === 'pencil'}>
          <FaPencilAlt />
        </ToolButton>
        <ToolButton onClick={() => handleToolChange('eraser')} active={tool === 'eraser'}>
          <FaEraser />
        </ToolButton>
        <ToolButton onClick={() => handleToolChange('rectangle')} active={tool === 'rectangle'}>
          <FaRegSquare />
        </ToolButton>
        <ToolButton onClick={() => handleToolChange('circle')} active={tool === 'circle'}>
          <FaCircle />
        </ToolButton>
        <ToolButton onClick={() => handleToolChange('line')} active={tool === 'line'}>
          <FaSlash />
        </ToolButton>
        <div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '40px', marginTop: '10px' }}
          />
        </div>
        <div>
          <input
            type="range"
            min="1"
            max="20"
            value={thickness}
            onChange={(e) => setThickness(parseInt(e.target.value, 10))}
            style={{ width: '40px', marginTop: '10px' }}
          />
        </div>
      </Sidebar>

      {/* Main Content */}
      <CanvasContainer>
        {/* Top Toolbar */}
        <Toolbar>
          {/* Navigation Buttons */}
          <ToolButton onClick={() => navigate('/')} title="Home">
            <FaHome />
          </ToolButton>
          <ToolButton onClick={() => navigate('/profile')} title="Profile">
            <FaUser />
          </ToolButton>

          {/* Divider */}
          <div style={{ width: '1px', height: '30px', backgroundColor: '#555', margin: '0 10px' }} />

          {/* Existing Toolbar Buttons */}
          <ToolButton onClick={handleUndo} disabled={historyStep === 0} title="Undo">
            <FaUndo />
          </ToolButton>
          <ToolButton onClick={handleRedo} disabled={historyStep >= history.length - 1} title="Redo">
            <FaRedo />
          </ToolButton>
          <ToolButton onClick={handleClear} title="Clear">
            <FaTrash />
          </ToolButton>
          <ToolButton onClick={handleSave} title="Save to Favorites">
            <FaSave />
          </ToolButton>
          <ToolButton onClick={handleDownload} title="Download">
            <FaDownload />
          </ToolButton>
        </Toolbar>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            touchAction: 'none',
            cursor: tool === 'eraser' ? 'not-allowed' : 'crosshair',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </CanvasContainer>
    </WhiteboardContainer>
  );
};

export default Whiteboard;

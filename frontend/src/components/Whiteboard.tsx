import React, { useRef, useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

enum Tool {
  Pencil = "pencil",
  Eraser = "eraser",
  Rectangle = "rectangle",
  Circle = "circle",
  Line = "line",
}

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>("#000");
  const [size, setSize] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [tool, setTool] = useState<Tool>(Tool.Pencil);
  const [actions, setActions] = useState<any[]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);

  let startX: number, startY: number;
  let lastX: number, lastY: number;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      setContext(ctx);
    }

    socket.on("draw", (data) => {
      drawLine(
        data.x0,
        data.y0,
        data.x1,
        data.y1,
        data.color,
        data.size,
        false
      );
      setActions((prev) => [...prev, { type: "line", ...data }]);
    });

    socket.on("drawShape", (data) => {
      drawShape(
        data.x0,
        data.y0,
        data.x1,
        data.y1,
        data.color,
        data.size,
        data.shape,
        false
      );
      setActions((prev) => [...prev, { type: "shape", ...data }]);
    });

    socket.on("undo", () => {
      if (actions.length === 0) return;
      actions.pop();
      redrawCanvas();
    });

    socket.on("redo", (action) => {
      actions.push(action);
      if (action.type === "line") {
        drawLine(
          action.x0,
          action.y0,
          action.x1,
          action.y1,
          action.color,
          action.size,
          false
        );
      } else if (action.type === "shape") {
        drawShape(
          action.x0,
          action.y0,
          action.x1,
          action.y1,
          action.color,
          action.size,
          action.shape,
          false
        );
      }
    });

    socket.on("clear", () => {
      if (context && canvasRef.current) {
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        setActions([]);
        setUndoStack([]);
      }
    });

    return () => {
      socket.off("draw");
      socket.off("drawShape");
      socket.off("undo");
      socket.off("redo");
      socket.off("clear");
    };
  }, [context]);

  const drawLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    strokeColor: string,
    strokeSize: number,
    emit: boolean
  ) => {
    if (!context) return;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeSize;
    context.stroke();
    context.closePath();

    if (emit) {
      socket.emit("draw", {
        x0,
        y0,
        x1,
        y1,
        color: strokeColor,
        size: strokeSize,
      });
      setActions((prev) => [
        ...prev,
        { type: "line", x0, y0, x1, y1, color: strokeColor, size: strokeSize },
      ]);
    }
  };

  const drawShape = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    strokeColor: string,
    strokeSize: number,
    shape: Tool,
    emit: boolean
  ) => {
    if (!context) return;

    context.beginPath();
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeSize;

    if (shape === Tool.Rectangle) {
      context.rect(x0, y0, x1 - x0, y1 - y0);
    } else if (shape === Tool.Circle) {
      const radius = Math.hypot(x1 - x0, y1 - y0);
      context.arc(x0, y0, radius, 0, 2 * Math.PI);
    } else if (shape === Tool.Line) {
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
    }

    context.stroke();
    context.closePath();

    if (emit) {
      socket.emit("drawShape", {
        x0,
        y0,
        x1,
        y1,
        color: strokeColor,
        size: strokeSize,
        shape,
      });
      setActions((prev) => [
        ...prev,
        {
          type: "shape",
          x0,
          y0,
          x1,
          y1,
          color: strokeColor,
          size: strokeSize,
          shape,
        },
      ]);
    }
  };

  const redrawCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    actions.forEach((action) => {
      if (action.type === "line") {
        drawLine(
          action.x0,
          action.y0,
          action.x1,
          action.y1,
          action.color,
          action.size,
          false
        );
      } else if (action.type === "shape") {
        drawShape(
          action.x0,
          action.y0,
          action.x1,
          action.y1,
          action.color,
          action.size,
          action.shape,
          false
        );
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    lastX = startX;
    lastY = startY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (tool === Tool.Pencil || tool === Tool.Eraser) {
      const strokeColor = tool === Tool.Eraser ? "#FFFFFF" : color;
      drawLine(lastX, lastY, currentX, currentY, strokeColor, size, true);
      lastX = currentX;
      lastY = currentY;
    } else {
      redrawCanvas();
      drawShape(startX, startY, currentX, currentY, color, size, tool, false);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDrawing(false);
    const rect = canvasRef.current!.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    if (tool !== Tool.Pencil && tool !== Tool.Eraser) {
      drawShape(startX, startY, endX, endY, color, size, tool, true);
    }
  };

  const handleClear = () => {
    if (context && canvasRef.current) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setActions([]);
      setUndoStack([]);
      socket.emit("clear");
    }
  };

  const handleUndo = () => {
    if (actions.length === 0) return;
    const lastAction = actions.pop();
    setUndoStack((prev) => [...prev, lastAction]);
    redrawCanvas();
    socket.emit("undo");
  };

  const handleRedo = () => {
    if (undoStack.length === 0) return;
    const actionToRedo = undoStack.pop();
    actions.push(actionToRedo);
    if (actionToRedo.type === "line") {
      drawLine(
        actionToRedo.x0,
        actionToRedo.y0,
        actionToRedo.x1,
        actionToRedo.y1,
        actionToRedo.color,
        actionToRedo.size,
        true
      );
    } else if (actionToRedo.type === "shape") {
      drawShape(
        actionToRedo.x0,
        actionToRedo.y0,
        actionToRedo.x1,
        actionToRedo.y1,
        actionToRedo.color,
        actionToRedo.size,
        actionToRedo.shape,
        true
      );
    }
    socket.emit("redo", actionToRedo);
  };

  const handleSave = async () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png");
      await axios.post(
        "/api/whiteboard/save",
        { image: dataURL },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Whiteboard saved to profile!");
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.href = canvasRef.current.toDataURL("image/png");
      link.download = "whiteboard.png";
      link.click();
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="absolute top-0 left-0 p-4 space-y-2">
        <SketchPicker
          color={color}
          onChangeComplete={(color) => setColor(color.hex)}
        />
        <div>
          <label>Brush Size: {size}</label>
          <input
            type="range"
            min="1"
            max="50"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTool(Tool.Pencil)}
            className={`px-2 py-1 rounded ${
              tool === Tool.Pencil ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Pencil
          </button>
          <button
            onClick={() => setTool(Tool.Rectangle)}
            className={`px-2 py-1 rounded ${
              tool === Tool.Rectangle ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Rectangle
          </button>
          <button
            onClick={() => setTool(Tool.Circle)}
            className={`px-2 py-1 rounded ${
              tool === Tool.Circle ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Circle
          </button>
          <button
            onClick={() => setTool(Tool.Line)}
            className={`px-2 py-1 rounded ${
              tool === Tool.Line ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setTool(Tool.Eraser)}
            className={`px-2 py-1 rounded ${
              tool === Tool.Eraser ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Eraser
          </button>
          <button
            onClick={handleUndo}
            className="px-4 py-2 text-white bg-gray-500 rounded"
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            className="px-4 py-2 text-white bg-gray-500 rounded"
          >
            Redo
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-white bg-red-500 rounded"
          >
            Clear
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-white bg-blue-500 rounded"
          >
            Download
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-green-500 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;

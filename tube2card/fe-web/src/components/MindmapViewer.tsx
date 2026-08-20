'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2, Download, ArrowDown, ArrowRight, ArrowUp, ArrowLeft } from 'lucide-react';

interface MindmapViewerProps {
  chart: string;
}

export default function MindmapViewer({ chart }: MindmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Trạng thái hướng của sơ đồ
  const [layout, setLayout] = useState<'TD' | 'LR' | 'BT' | 'RL'>('TD');

  // Cố gắng tự động phát hiện layout ban đầu từ chuỗi chart do AI sinh ra
  useEffect(() => {
    // Thay thế ký tự \n (dạng chuỗi) thành dấu xuống dòng thực sự nếu có
    const formattedChart = chart.replace(/\\n/g, '\n');
    const cleanChart = formattedChart.replace(/```mermaid\n?/gi, '').replace(/```\n?/g, '').trim();
    const match = cleanChart.match(/^(graph|flowchart)\s+(TD|LR|BT|RL)/i);
    if (match && match[2]) {
      setLayout(match[2].toUpperCase() as any);
    }
  }, [chart]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      flowchart: { htmlLabels: false }
    });

    const renderChart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Thay thế ký tự \n (dạng chuỗi) thành dấu xuống dòng thực sự nếu có
        const formattedChart = chart.replace(/\\n/g, '\n');
        
        // Loại bỏ markdown codeblock nếu AI trả về kèm theo
        const cleanChart = formattedChart.replace(/```mermaid\n?/gi, '').replace(/```\n?/g, '').trim();
        
        // Thay đổi hướng sơ đồ dựa trên state `layout`
        const modifiedChart = cleanChart.replace(/^(graph|flowchart)\s+(TD|LR|BT|RL)/i, `$1 ${layout}`);
        
        // Tạo một ID duy nhất cho biểu đồ
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, modifiedChart);
        setSvgContent(svg);
      } catch (err: any) {
        console.error("Mermaid Render Error:", err);
        setError("Không thể vẽ Sơ đồ tư duy. Dữ liệu có thể bị lỗi định dạng.");
      } finally {
        setLoading(false);
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart, layout]);

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgEl = doc.documentElement;
    
    // 1. Nhúng CSS tổng quát
    const styleEl = doc.createElementNS("http://www.w3.org/2000/svg", "style");
    styleEl.textContent = `
      * { font-family: sans-serif !important; }
      text, span, div, p { fill: #ffffff !important; color: #ffffff !important; }
      .node rect, .node circle, .node ellipse, .node polygon, .node path { fill: #27272a !important; stroke: #52525b !important; stroke-width: 1px !important; }
      .edgePath .path { stroke: #a1a1aa !important; stroke-width: 1.5px !important; }
      .edgeLabel { background-color: #18181b !important; fill: #ffffff !important; }
      marker path { fill: #a1a1aa !important; stroke: none !important; }
    `;
    svgEl.insertBefore(styleEl, svgEl.firstChild);

    // 2. Ép style Inline cho tất cả các thẻ chữ (khắc phục triệt để lỗi của foreignObject trên một số app xem ảnh)
    const textNodes = svgEl.querySelectorAll('text, span, div, p, foreignObject');
    textNodes.forEach((node) => {
      if (node instanceof HTMLElement || node instanceof SVGElement) {
        node.style.setProperty('fill', '#ffffff', 'important');
        node.style.setProperty('color', '#ffffff', 'important');
      }
    });

    // 3. Thêm nền đen tuyền (zinc-950)
    const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", "#09090b"); 
    svgEl.insertBefore(rect, svgEl.firstChild);
    
    const finalSvg = new XMLSerializer().serializeToString(svgEl);

    const blob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindmap_${layout}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !svgContent) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-96 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 p-8 text-center">
        <p className="mb-4">{error}</p>
        <pre className="text-xs text-left w-full overflow-auto p-4 bg-zinc-950 rounded-xl">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Thanh công cụ điều khiển sơ đồ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setLayout('TD')}
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${layout === 'TD' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title="Từ trên xuống dưới (Dọc)"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setLayout('LR')}
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${layout === 'LR' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title="Từ trái sang phải (Ngang)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setLayout('BT')}
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${layout === 'BT' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title="Từ dưới lên trên (Dọc ngược)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setLayout('RL')}
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${layout === 'RL' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title="Từ phải sang trái (Ngang ngược)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {svgContent && (
          <button 
            onClick={handleDownloadSVG}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-purple-600 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-all border border-zinc-700"
            title="Tải sơ đồ dưới dạng ảnh SVG chất lượng cao (Có nền đen)"
          >
            <Download className="w-4 h-4" /> Tải ảnh (SVG)
          </button>
        )}
      </div>

      {/* Vùng hiển thị sơ đồ */}
      <div className="relative w-full h-[600px] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 overflow-auto flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 bg-zinc-950/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}
        <div 
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="mermaid-container w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full transition-opacity duration-300"
          style={{ opacity: loading ? 0.3 : 1 }}
        />
      </div>
    </div>
  );
}

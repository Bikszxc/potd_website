import React from 'react';

export default function MarkdownGuide() {
  return (
    <div className="bg-[#0f101f] p-4 border border-white/10 rounded text-xs text-gray-400 font-mono space-y-2 h-full overflow-y-auto max-h-[300px]">
      <h4 className="text-[#FED405] font-bold uppercase mb-2">Markdown Intel</h4>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <strong className="text-white">Headers</strong>
          <div className="text-gray-500"># H1 (Title)</div>
          <div className="text-gray-500">## H2 (Section)</div>
          <div className="text-gray-500">### H3 (Subsection)</div>
        </div>
        
        <div>
          <strong className="text-white">Emphasis</strong>
          <div className="text-gray-500">**Bold**</div>
          <div className="text-gray-500">*Italic*</div>
          <div className="text-gray-500">~~Strike~~</div>
        </div>
        
        <div>
          <strong className="text-white">Lists</strong>
          <div className="text-gray-500">- Item 1</div>
          <div className="text-gray-500">1. Numbered</div>
          <div className="text-gray-500">- [x] Task</div>
        </div>
        
        <div>
          <strong className="text-white">Extras</strong>
          <div className="text-gray-500">[Link](url)</div>
          <div className="text-gray-500">![Img](url)</div>
          <div className="text-gray-500">`Inline Code`</div>
        </div>
      </div>
      
      <div>
        <strong className="text-white">Code Block</strong>
        <div className="bg-black/50 p-2 mt-1 text-[10px] whitespace-pre">
```js
console.log('Code');
```
        </div>
      </div>
      
      <div>
         <strong className="text-white">Table</strong>
         <div className="bg-black/50 p-2 mt-1 text-[10px] whitespace-pre">
| Head | Head |
| ---- | ---- |
| Cell | Cell |
         </div>
      </div>

       <div>
         <strong className="text-white">HTML</strong>
         <div className="text-gray-500 text-[10px] mt-1">
           &lt;br&gt; &lt;center&gt; &lt;b&gt;Tags&lt;/b&gt;
         </div>
      </div>
    </div>
  );
}
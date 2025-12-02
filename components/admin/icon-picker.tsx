import * as Icons from 'lucide-react';

export const AVAILABLE_ICONS = [
  'Shield', 'Zap', 'Star', 'Crown', 'Skull', 'Swords', 'Target', 
  'Ghost', 'Flame', 'Gem', 'Medal', 'Trophy', 'Heart', 'Anchor',
  'Atom', 'Biohazard', 'Bomb', 'Crosshair', 'Flag', 'Gamepad'
];

export default function IconPicker({ 
  selected, 
  onChange 
}: { 
  selected: string, 
  onChange: (icon: string) => void 
}) {
  return (
    <div className="grid grid-cols-5 gap-2 bg-[#191A30] p-2 border border-white/10 rounded h-48 overflow-y-auto">
      {AVAILABLE_ICONS.map(iconName => {
        const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
        const isSelected = selected === iconName;
        
        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onChange(iconName)}
            className={`p-2 flex flex-col items-center gap-1 rounded transition-colors ${isSelected ? 'bg-[#FED405] text-[#191A30]' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            <IconComponent size={20} />
            <span className="text-[10px] truncate w-full text-center">{iconName}</span>
          </button>
        );
      })}
    </div>
  );
}

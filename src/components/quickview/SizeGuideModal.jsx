import { X } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-neutral-200 shadow-2xl max-w-lg w-full p-6 text-left space-y-5 rounded-xs relative">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Atelier Standards
            </span>
            <h3 className="text-base font-light uppercase tracking-wider text-neutral-900">
              Size & Measurement Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-500 font-light leading-relaxed">
          Measurements reflect true garment specifications in inches and centimeters. For relaxed drape silhouettes, select your standard size.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-neutral-200">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-[10px] uppercase tracking-widest text-neutral-700">
                <th className="p-2.5 font-bold">Size</th>
                <th className="p-2.5 font-bold">Chest (in/cm)</th>
                <th className="p-2.5 font-bold">Waist (in/cm)</th>
                <th className="p-2.5 font-bold">Hip (in/cm)</th>
                <th className="p-2.5 font-bold">Length (in/cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-600">
              <tr className="hover:bg-neutral-50">
                <td className="p-2.5 font-bold text-neutral-900">XS</td>
                <td className="p-2.5">34" / 86cm</td>
                <td className="p-2.5">28" / 71cm</td>
                <td className="p-2.5">35" / 89cm</td>
                <td className="p-2.5">26" / 66cm</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="p-2.5 font-bold text-neutral-900">S</td>
                <td className="p-2.5">36" / 91cm</td>
                <td className="p-2.5">30" / 76cm</td>
                <td className="p-2.5">37" / 94cm</td>
                <td className="p-2.5">27" / 68cm</td>
              </tr>
              <tr className="hover:bg-neutral-50 bg-neutral-50/50">
                <td className="p-2.5 font-bold text-neutral-900">M</td>
                <td className="p-2.5">38" / 96cm</td>
                <td className="p-2.5">32" / 81cm</td>
                <td className="p-2.5">39" / 99cm</td>
                <td className="p-2.5">28" / 71cm</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="p-2.5 font-bold text-neutral-900">L</td>
                <td className="p-2.5">41" / 104cm</td>
                <td className="p-2.5">35" / 89cm</td>
                <td className="p-2.5">42" / 106cm</td>
                <td className="p-2.5">29" / 74cm</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="p-2.5 font-bold text-neutral-900">XL</td>
                <td className="p-2.5">44" / 112cm</td>
                <td className="p-2.5">38" / 96cm</td>
                <td className="p-2.5">45" / 114cm</td>
                <td className="p-2.5">30" / 76cm</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="p-2.5 font-bold text-neutral-900">XXL</td>
                <td className="p-2.5">47" / 119cm</td>
                <td className="p-2.5">41" / 104cm</td>
                <td className="p-2.5">48" / 122cm</td>
                <td className="p-2.5">31" / 79cm</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold py-2.5 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close Size Guide
          </button>
        </div>
      </div>
    </div>
  );
}

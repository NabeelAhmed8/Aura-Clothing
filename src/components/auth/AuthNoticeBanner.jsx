import PropTypes from 'prop-types';
import { Lock, CheckCircle2 } from 'lucide-react';

/**
 * Single Responsibility: Renders standard authentication alert/notice banners.
 */
export default function AuthNoticeBanner({
  variant = 'warning',
  title,
  message,
}) {
  if (!message) return null;

  const isSuccess = variant === 'success';

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xs flex items-center space-x-3 text-left animate-fade-in shadow-2xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
        <p className="text-xs font-medium text-emerald-800">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xs flex items-start space-x-3 text-left animate-fade-in shadow-2xs">
      <div className="p-1.5 bg-amber-100 text-amber-900 rounded-2xs shrink-0 mt-0.5">
        <Lock className="w-4 h-4 text-amber-800" />
      </div>
      <div className="space-y-0.5">
        {title && (
          <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
            {title}
          </p>
        )}
        <p className="text-[11px] text-amber-800 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

AuthNoticeBanner.propTypes = {
  variant: PropTypes.oneOf(['warning', 'success']),
  title: PropTypes.string,
  message: PropTypes.string,
};

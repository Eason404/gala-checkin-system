
import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface WaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const WaiverModal: React.FC<WaiverModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-cny-dark/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-cny-red p-6 sm:p-8 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="bg-white/20 p-3 rounded-2xl"><ShieldCheck className="w-6 h-6 text-cny-gold" /></div>
             <div>
                <h3 className="text-xl font-bold tracking-tight">免责声明与媒体授权</h3>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Terms, Waiver & Privacy</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6 sm:p-10 flex-1 overflow-y-auto space-y-8 text-gray-600 leading-relaxed font-medium text-sm">
          <section className="space-y-4">
            <h4 className="text-gray-900 font-bold text-base flex items-center gap-2 border-b-2 border-cny-red/10 pb-2">
               <div className="w-1.5 h-4 bg-cny-red rounded-full"></div> 
               1. 风险承担与责任豁免 (Assumption of Risk & Liability Waiver)
            </h4>
            <p>
              本人确认自愿参加本活动。本人理解并自愿承担活动中可能存在的风险（包括但不限于人身伤害、财物损失、食品过敏或传染性疾病）。 <strong>责任豁免：</strong> 在法律允许的最大范围内，本人代表本人及随行未成年人，同意豁免并释放 Natick Chinese Association Inc. (NCA)、Natick High School Chinese Club、Natick 公立学校 (NPS)、及其各自的董事、官员、成员，志愿者和代理人（合称“被免责方”）因其普通过失 (Ordinary Negligence) 导致的任何索赔或责任。本人承诺不对被免责方提起诉讼。
            </p>
            <p className="text-xs italic text-gray-400">
              I voluntarily participate in the Event and assume all risks, including but not limited to personal injury, property loss, food allergies, or communicable diseases. Release & Waiver: To the fullest extent permitted by law, on behalf of myself and any minors, I hereby release and waive any claims against Natick Chinese Association Inc., Natick High School Chinese Club, Natick Public Schools (NPS), and their respective directors, officers, members, volunteers, and agents (the “Released Parties”) arising from their ordinary negligence. I covenant not to sue the Released Parties for any such claims.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-gray-900 font-bold text-base flex items-center gap-2 border-b-2 border-cny-red/10 pb-2">
               <div className="w-1.5 h-4 bg-cny-red rounded-full"></div> 
               2. 补偿条款 (Indemnification)
            </h4>
            <p>
              如因本人或本人监护的未成年人的行为（如损坏场地、违反规则）导致第三方对 NCA 或学校提起索赔，本人同意承担相关法律责任，并赔偿被免责方由此产生的全部损失（包括合理的律师费）。
            </p>
            <p className="text-xs italic text-gray-400">
              I agree to indemnify and hold harmless the Released Parties from any third-party claims arising out of my (or my minor’s) actions, misconduct, or violation of rules, including reimbursement of reasonable attorneys’ fees.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-gray-900 font-bold text-base flex items-center gap-2 border-b-2 border-cny-red/10 pb-2">
               <div className="w-1.5 h-4 bg-cny-red rounded-full"></div> 
               3. 食品安全与过敏提示 (Food Safety & Allergy Warning)
            </h4>
            <p>
              活动食品可能含有或接触常见过敏原。主办方不保证食品完全不含过敏原，且对第三方供应商提供的成分信息准确性不承担责任。参与者需自行判断食用风险。
            </p>
            <p className="text-xs italic text-gray-400">
              Food provided may contain or have come into contact with common allergens. The Organizers do not guarantee an allergen-free environment and are not responsible for the accuracy of ingredients provided by third-party vendors. Attendees consume food at their own risk.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-gray-900 font-bold text-base flex items-center gap-2 border-b-2 border-cny-red/10 pb-2">
               <div className="w-1.5 h-4 bg-cny-red rounded-full"></div> 
               4. 媒体授权 (Media Release)
            </h4>
            <p className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <strong>本活动为公共活动，摄影录像是报名的必要条件。</strong> 本人授权主办方在全球范围内永久、免费使用本人及家属的肖像（照片、视频）用于社区宣传、新闻、社交媒体及筹款，无需事先审核。 <strong>注意： 如不同意被拍摄，请勿报名或入场。</strong>
            </p>
            <p className="text-xs italic text-gray-400">
              This is a public event; media consent is a condition of entry. I grant the Organizers the irrevocable, worldwide, royalty-free right to use my and my family’s likeness in photos/videos for community news, social media, marketing, and fundraising, without further approval. Note: If you do not agree, please do not proceed with registration.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-gray-900 font-bold text-base flex items-center gap-2 border-b-2 border-cny-red/10 pb-2">
               <div className="w-1.5 h-4 bg-cny-red rounded-full"></div> 
               5. 紧急医疗授权 (Emergency Medical Authorization)
            </h4>
            <p>
              如遇紧急状况，本人授权主办方呼叫 911 或采取急救措施。本人理解主办方无专业医疗义务，且本人将承担所有相关医疗和救护车费用。
            </p>
            <p className="text-xs italic text-gray-400">
              In an emergency, I authorize the Organizers to call 911 or provide basic first aid. I acknowledge the Organizers have no professional medical duty and I will assume all costs for medical treatment and transportation.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-gray-900 font-bold text-base flex items-center gap-2 border-b-2 border-cny-red/10 pb-2">
               <div className="w-1.5 h-4 bg-cny-red rounded-full"></div> 
               6. 隐私政策 (Privacy Policy)
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>个人联系信息：</strong> 仅用于活动管理及未来通知。此类信息将在活动结束后 12 个月内进行清理或匿名化（除非法律要求留存）。</li>
              <li><strong>影像资料：</strong> 作为宣传材料不受此删除限制。</li>
            </ul>
            <p className="text-xs italic text-gray-400">
              Personal data will be used for event management and future announcements. Such data will be purged or anonymized within 12 months post-event, except where retention is required by law. Media data is exempt from this deletion policy.
            </p>
          </section>
        </div>

        <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 shrink-0">
           <button 
             onClick={() => { onConfirm(); onClose(); }}
             className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             我已阅读并理解 I UNDERSTAND AND AGREE
           </button>
        </div>
      </div>
    </div>
  );
};

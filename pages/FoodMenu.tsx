import React from 'react';
import { Utensils, Banknote, Flame, AlertTriangle, Baby, Cookie } from 'lucide-react';

interface MenuItem {
    code?: string;
    zh: string;
    en: string;
    spicy?: boolean;
}

const snacks: { zh: string; en: string }[] = [
    { zh: '糖葫芦', en: 'Sugar Coated Fruits' },
    { zh: '汤圆', en: 'Glutinous Rice Balls' },
    { zh: '青团', en: 'QingTuan' },
    { zh: '奶茶', en: 'Boba Tea' },
    { zh: '水果奶昔', en: 'Mango Smoothie' },
    { zh: '麻花', en: 'Twisted Fried Dough Sticks' },
    { zh: '酥皮点心', en: 'Puff Pastry' },
    { zh: '甜甜圈', en: 'Doughnut' },
];

const adultMeals: MenuItem[] = [
    { code: 'C1', zh: '红烧排骨 + 香菇油菜', en: 'Braised Pork Ribs + Baby Bok Choy with Mushrooms' },
    { code: 'C2', zh: '宫保鸡丁（甜辣）+ 素炒圆白菜', en: 'Kung Pao Chicken (Sweet & Spicy) + Stir-Fried Cabbage', spicy: true },
    { code: 'C3', zh: '红烧鸡翅 + 素炒圆白菜', en: 'Braised Chicken Wings + Stir-Fried Cabbage' },
    { code: 'C4', zh: '芹菜炒香干 + 香菇油菜', en: 'Stir-Fried Celery with Dried Tofu + Baby Bok Choy with Mushrooms' },
    { code: 'L1', zh: '铁板孜然牛肉（辣）+ 四季豆茄子', en: 'Sizzling Cumin Beef (Spicy) + Green Beans & Eggplant', spicy: true },
    { code: 'L2', zh: '夫妻肺片（辣）+ 素炒三丝', en: 'Sichuan Sliced Beef in Chili Sauce (Spicy) + Stir-Fried Shredded Vegetables', spicy: true },
    { code: 'L3', zh: '农家小炒肉（辣）+ 花菜', en: 'Farmhouse Stir-Fried Pork (Spicy) + Stir-Fried Cauliflower', spicy: true },
    { code: 'L4', zh: '梅菜扣肉 + 干煸四季豆', en: 'Pork Belly with Preserved Mustard Greens + Dry-Fried Green Beans' },
];

const kidsMeals: { zh: string; en: string }[] = [
    { zh: '鸡肉炒饭（含鸡蛋）', en: 'Fried Rice with Chicken and Eggs' },
    { zh: '荤炒面（含鸡蛋）', en: 'Fried Noodle with Chicken and Eggs' },
    { zh: '素菜炒面（含鸡蛋）', en: 'Vegetarian Fried Noodle (with Eggs)' },
];

const SpicyBadge: React.FC = () => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/30 text-red-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse">
        <Flame className="w-3 h-3 text-red-400" /> 辣 Spicy
    </span>
);



const FoodMenu: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 antialiased">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    新春美食
                </h1>
                <p className="text-white/60 text-sm font-medium uppercase tracking-widest mt-1">
                    Food & Snacks
                </p>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* Section 1: Snacks */}
            {/* ═══════════════════════════════════════════ */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 text-cny-dark rounded-xl flex items-center justify-center shadow-lg">
                        <Cookie className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">风味小吃</h2>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Authentic Snacks</p>
                    </div>
                </div>

                {/* Cash Only Notice */}
                <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-cny-gold/10 rounded-2xl border border-cny-gold/20">
                    <Banknote className="w-4 h-4 text-cny-gold flex-shrink-0" />
                    <span className="text-cny-gold text-xs font-bold">
                        可现场购买，请预备现金零钱 / Cash Only
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {snacks.map((item, idx) => (
                        <div
                            key={idx}
                            className="glass-dark rounded-2xl p-4 border border-white/10 hover:border-cny-gold/30 transition-colors text-center"
                        >
                            <p className="text-white font-bold text-sm mb-1">{item.zh}</p>
                            <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">{item.en}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* Section 2: Adult Lunch */}
            {/* ═══════════════════════════════════════════ */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cny-red to-red-700 text-white rounded-xl flex items-center justify-center shadow-lg">
                        <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">美味套餐</h2>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Adult Lunch</p>
                    </div>
                </div>

                {/* Ticket Benefit Badge */}
                <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <span className="text-emerald-400 text-xs font-bold">
                        🎫 成人门票福利 · 请用盒饭序号领饭 / Included in Tickets
                    </span>
                </div>

                <div className="space-y-3">
                    {adultMeals.map((meal, idx) => (
                        <div
                            key={idx}
                            className="glass-dark rounded-2xl p-4 border border-white/10 hover:border-cny-gold/20 transition-colors overflow-hidden relative"
                        >
                            <div className="flex items-start gap-3">
                                {/* Code Badge */}
                                <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-sm shadow-md ${meal.spicy
                                    ? 'bg-gradient-to-br from-red-500 to-orange-600 text-white'
                                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                    }`}>
                                    {meal.code}
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <h3 className="text-sm font-bold text-white">{meal.zh}</h3>
                                        {meal.spicy && <SpicyBadge />}
                                    </div>
                                    <p className="text-white/50 text-xs leading-relaxed">{meal.en}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* Section 3: Kids Lunch */}
            {/* ═══════════════════════════════════════════ */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                        <Baby className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">小朋友午饭福利</h2>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Kids Lunch</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {kidsMeals.map((meal, idx) => (
                        <div
                            key={idx}
                            className="glass-dark rounded-2xl p-4 border border-white/10 hover:border-sky-400/20 transition-colors flex items-center gap-3"
                        >
                            <div className="w-8 h-8 flex-shrink-0 bg-sky-400/20 text-sky-400 rounded-lg flex items-center justify-center font-black text-xs border border-sky-400/30">
                                {idx + 1}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white">{meal.zh}</p>
                                <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">{meal.en}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* Allergen Disclaimer */}
            {/* ═══════════════════════════════════════════ */}
            <div className="mt-6 mb-4 px-4 py-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-300/90 text-xs font-bold mb-2">⚠️ 过敏提示 / Allergen Notice</p>
                        <p className="text-yellow-200/60 text-[11px] leading-relaxed mb-2">
                            活动食品可能含有或接触常见过敏原。主办方不保证食品完全不含过敏原，且对第三方供应商提供的成分信息准确性不承担责任。参与者需自行判断食用风险。
                        </p>
                        <p className="text-yellow-200/50 text-[10px] leading-relaxed">
                            Food provided may contain or have come into contact with common allergens. The Organizers do not guarantee an allergen-free environment and are not responsible for the accuracy of ingredients provided by third-party vendors. Attendees consume food at their own risk.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodMenu;

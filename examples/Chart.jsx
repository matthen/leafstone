// @requires recharts@^2.8.0
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

const data = [
  { month: 'Jan', sales: 4000, profit: 2400, expenses: 1600 },
  { month: 'Feb', sales: 3000, profit: 1398, expenses: 1602 },
  { month: 'Mar', sales: 2000, profit: 3800, expenses: -1800 },
  { month: 'Apr', sales: 2780, profit: 3908, expenses: -1128 },
  { month: 'May', sales: 1890, profit: 4800, expenses: -2910 },
  { month: 'Jun', sales: 2390, profit: 3800, expenses: -1410 },
  { month: 'Jul', sales: 3490, profit: 4300, expenses: -810 },
];

function Chart() {
  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <div className="flex items-center justify-center gap-3 mb-8">
        <BarChart3 className="text-purple-400" size={32} />
        <h2 className="text-3xl font-bold text-white">
          Sales Performance Dashboard
        </h2>
        <TrendingUp className="text-green-400" size={32} />
      </div>
      
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#A855F7' }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#34D399' }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: '#F87171' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-purple-300 font-medium">Sales</span>
          </div>
          <p className="text-2xl font-bold text-white">$24,550</p>
          <p className="text-purple-400 text-sm">Average monthly</p>
        </div>
        
        <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-300 font-medium">Profit</span>
          </div>
          <p className="text-2xl font-bold text-white">$20,498</p>
          <p className="text-green-400 text-sm">Average monthly</p>
        </div>
        
        <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-300 font-medium">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-white">$4,052</p>
          <p className="text-red-400 text-sm">Average monthly</p>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          📊 Interactive chart built with Recharts and Tailwind CSS
        </p>
      </div>
    </div>
  );
}

export default Chart;

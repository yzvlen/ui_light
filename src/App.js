import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Moon, Clock, Edit2, Save, ChevronRight, Power, Fish, Waves, Leaf, Settings, Share2, Info, Download, Users } from 'lucide-react';
// 渲染预设场景图标
const renderPresetIcon = (iconName) => {
  switch(iconName) {
    case 'sun':
      return <Sun size={18} className="text-white" />;
    case 'fish':
      return <Fish size={18} className="text-white" />;
    case 'waves':
      return <Waves size={18} className="text-white" />;
    case 'leaf':
      return <Leaf size={18} className="text-white" />;
    case 'settings':
      return <Settings size={18} className="text-white" />;
    default:
      return <Sun size={18} className="text-white" />;
  }
};
const AquariumLightController = () => {
  // 状态定义
  const [selectedTab, setSelectedTab] = useState('presets');
  const [isOn, setIsOn] = useState(true);
  const [transitionMode, setTransitionMode] = useState('gradual');
  const [groupControl, setGroupControl] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // 初始时间段设置
  const [timeSettings, setTimeSettings] = useState([
    { id: 1, time: '06:00', label: '日出', r: 80, g: 60, b: 40, w: 50 },
    { id: 2, time: '10:00', label: '日间', r: 100, g: 100, b: 70, w: 100 },
    { id: 3, time: '16:00', label: '傍晚', r: 90, g: 70, b: 50, w: 80 },
    { id: 4, time: '20:00', label: '日落', r: 70, g: 40, b: 60, w: 40 },
    { id: 5, time: '22:00', label: '夜间', r: 20, g: 10, b: 40, w: 10 }
  ]);
  
  // 预设场景
  const [presetScenes, setPresetScenes] = useState([
    { id: 1, name: '自定义', icon: 'settings', r: 80, g: 80, b: 80, w: 80 },
    { id: 2, name: '龙鱼模式', icon: 'fish', r: 70, g: 60, b: 90, w: 80 },
    { id: 3, name: '锦鲤模式', icon: 'fish', r: 90, g: 70, b: 50, w: 70 },
    { id: 4, name: '兰寿模式', icon: 'fish', r: 60, g: 80, b: 100, w: 50 },
    { id: 5, name: '溪流模式', icon: 'waves', r: 50, g: 90, b: 100, w: 60 },
    { id: 6, name: '雷龙模式', icon: 'fish', r: 40, g: 60, b: 100, w: 40 },
    { id: 7, name: '海水模式', icon: 'waves', r: 30, g: 80, b: 100, w: 70 },
    { id: 8, name: '珊瑚模式', icon: 'waves', r: 90, g: 60, b: 70, w: 90 },
    { id: 9, name: '吉罗模式', icon: 'fish', r: 60, g: 90, b: 70, w: 50 },
    { id: 10, name: '爆燥模式', icon: 'waves', r: 100, g: 50, b: 30, w: 80 },
    { id: 11, name: '水草模式', icon: 'leaf', r: 40, g: 100, b: 60, w: 50 },
    { id: 12, name: '南美模式', icon: 'waves', r: 80, g: 70, b: 40, w: 60 }
  ]);
  
  // 设备信息
  const deviceInfo = {
    deviceName: 'Mi AquaLight Pro',
    deviceID: 'AL928374651',
    firmwareVersion: 'v2.3.5',
    lastUpdated: '2025-02-28',
    ipAddress: '192.168.1.105',
    macAddress: '00:1B:44:11:3A:B7'
  };
  
  // 当前设置
  const currentSetting = {
    label: '日间',
    time: '10:00',
    r: 100,
    g: 100,
    b: 70,
    w: 100
  };
  
  // 生成曲线图数据
  const generateChartData = () => {
    const chartData = [];
    
    // 先添加午夜开始的点
    if (timeSettings[timeSettings.length - 1].time !== '00:00') {
      chartData.push({
        time: '00:00', 
        R: timeSettings[timeSettings.length - 1].r,
        G: timeSettings[timeSettings.length - 1].g,
        B: timeSettings[timeSettings.length - 1].b,
        W: timeSettings[timeSettings.length - 1].w
      });
    }
    
    // 添加所有时间设置点
    for (const setting of timeSettings) {
      chartData.push({
        time: setting.time,
        label: setting.label,
        R: setting.r,
        G: setting.g,
        B: setting.b,
        W: setting.w
      });
    }
    
    // 添加结束点(24:00，与00:00相同的值)
    chartData.push({
      time: '24:00',
      R: chartData[0].R,
      G: chartData[0].G,
      B: chartData[0].B,
      W: chartData[0].W
    });
    
    // 对时间进行排序
    chartData.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      
      // 将24:00特殊处理为最大值
      const totalMinutesA = a.time === '24:00' ? 24 * 60 : timeA[0] * 60 + timeA[1];
      const totalMinutesB = b.time === '24:00' ? 24 * 60 : timeB[0] * 60 + timeB[1];
      
      return totalMinutesA - totalMinutesB;
    });
    
    // 添加中间插值点以使曲线更平滑
    const interpolatedData = [];
    for (let i = 0; i < chartData.length - 1; i++) {
      interpolatedData.push(chartData[i]);
      
      const current = chartData[i];
      const next = chartData[i + 1];
      
      // 计算两个时间点之间的时间差(分钟)
      const [currentHour, currentMin] = current.time.split(':').map(Number);
      const [nextHour, nextMin] = next.time.split(':').map(Number);
      
      // 计算总分钟数
      let currentTotalMins = current.time === '24:00' ? 24 * 60 : currentHour * 60 + currentMin;
      let nextTotalMins = next.time === '24:00' ? 24 * 60 : nextHour * 60 + nextMin;
      
      if (nextTotalMins < currentTotalMins) {
        nextTotalMins += 24 * 60; // 跨天的情况
      }
      
      const timeDiff = nextTotalMins - currentTotalMins;
      
      // 只有在时间差足够大的时候才添加中间点
      if (timeDiff >= 120) { // 至少有2小时的差
        // 计算中间点的数量，最多添加3个中间点
        const numInterpolations = Math.min(3, Math.floor(timeDiff / 60));
        
        for (let j = 1; j <= numInterpolations; j++) {
          const ratio = j / (numInterpolations + 1);
          const interpolatedMins = currentTotalMins + timeDiff * ratio;
          const hours = Math.floor((interpolatedMins % (24 * 60)) / 60);
          const mins = Math.floor(interpolatedMins % 60);
          
          interpolatedData.push({
            time: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
            R: Math.round(current.R + (next.R - current.R) * ratio),
            G: Math.round(current.G + (next.G - current.G) * ratio),
            B: Math.round(current.B + (next.B - current.B) * ratio),
            W: Math.round(current.W + (next.W - current.W) * ratio),
            isInterpolated: true
          });
        }
      }
    }
    
    interpolatedData.push(chartData[chartData.length - 1]);
    return interpolatedData;
  };
  
  // 动态生成曲线图数据
  const chartData = generateChartData();
  
  // 渲染颜色预览
  const renderColorPreview = (r, g, b, w) => {
    const wFactor = w / 100;
    const displayR = Math.min(255, r * 2.55 + (255 * wFactor * 0.3));
    const displayG = Math.min(255, g * 2.55 + (255 * wFactor * 0.3));
    const displayB = Math.min(255, b * 2.55 + (255 * wFactor * 0.3));
    
    return {
      backgroundColor: `rgb(${displayR}, ${displayG}, ${displayB})`
    };
  };
  
  // 计算每个时间段的结束时间
  const getEndTime = (index) => {
    if (index >= timeSettings.length - 1) {
      return timeSettings[0].time; // 最后一个时间段的结束时间是第一个时间段的开始时间
    } else {
      return timeSettings[index + 1].time; // 其他时间段的结束时间是下一个时间段的开始时间
    }
  };
  
  // 处理亮度变化
  const handleBrightnessChange = (id, channel, value) => {
    setTimeSettings(timeSettings.map(setting => 
      setting.id === id ? { ...setting, [channel]: parseInt(value) } : setting
    ));
  };
  
  // 处理自定义颜色变化
  const handleCustomColorChange = (channel, value) => {
    const newPresetScenes = [...presetScenes];
    const customPresetIndex = newPresetScenes.findIndex(p => p.id === 1);
    newPresetScenes[customPresetIndex] = {
      ...newPresetScenes[customPresetIndex],
      [channel]: parseInt(value)
    };
    setPresetScenes(newPresetScenes);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="text-white text-lg font-medium">智能水族灯</h3>
          <p className="text-white text-opacity-80 text-sm">客厅 · 90cm鱼缸</p>
        </div>
        <div 
          className={`w-12 h-6 ${isOn ? 'bg-white' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors`}
          onClick={() => setIsOn(!isOn)}
        >
          <div 
            className={`w-5 h-5 bg-blue-500 rounded-full absolute top-0.5 transition-all ${isOn ? 'right-0.5' : 'left-0.5'}`}
          ></div>
        </div>
      </div>
      
      {/* 当前状态 */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">当前模式</p>
                          <p className="text-gray-800 font-medium">{currentSetting.label} ({currentSetting.time} - {getEndTime(timeSettings.findIndex(s => s.label === currentSetting.label))})</p>
          </div>
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full mr-3" 
              style={renderColorPreview(currentSetting.r, currentSetting.g, currentSetting.b, currentSetting.w)}
            ></div>
            <div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-4 text-red-500">R</span>
                <span className="ml-1">{currentSetting.r}%</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-4 text-green-500">G</span>
                <span className="ml-1">{currentSetting.g}%</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-4 text-blue-500">B</span>
                <span className="ml-1">{currentSetting.b}%</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-4 text-gray-500">W</span>
                <span className="ml-1">{currentSetting.w}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 选项卡 */}
      <div className="flex border-b overflow-x-auto">
        <div 
          className={`px-3 py-3 text-sm cursor-pointer whitespace-nowrap ${selectedTab === 'presets' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('presets')}
        >
          预设场景
        </div>
        <div 
          className={`px-3 py-3 text-sm cursor-pointer whitespace-nowrap ${selectedTab === 'curve' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('curve')}
        >
          亮度曲线
        </div>
        <div 
          className={`px-3 py-3 text-sm cursor-pointer whitespace-nowrap ${selectedTab === 'settings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('settings')}
        >
          时间设置
        </div>
        <div 
          className={`px-3 py-3 text-sm cursor-pointer whitespace-nowrap ${selectedTab === 'params' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('params')}
        >
          参数设置
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-4">
        {/* 亮度曲线 */}
        {selectedTab === 'curve' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">24小时亮度曲线</h4>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`]} />
                  <Line type="monotone" dataKey="R" stroke="#f87171" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="G" stroke="#4ade80" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="B" stroke="#60a5fa" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="W" stroke="#9ca3af" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">红光</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">绿光</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">蓝光</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">白光</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 时间设置 */}
        {selectedTab === 'settings' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">时间段设置</h4>
            {timeSettings.map((setting) => (
              <div key={setting.id} className="mb-4 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    {setting.label === '日出' && <Sun size={16} className="text-orange-500 mr-2" />}
                    {setting.label === '日间' && <Sun size={16} className="text-yellow-500 mr-2" />}
                    {setting.label === '傍晚' && <Sun size={16} className="text-orange-400 mr-2" />}
                    {setting.label === '日落' && <Sun size={16} className="text-red-400 mr-2" />}
                    {setting.label === '夜间' && <Moon size={16} className="text-blue-500 mr-2" />}
                    <div>
                      <span className="text-gray-800">{setting.label}</span>
                      <div className="text-xs text-gray-500">
                        {setting.time} - {getEndTime(timeSettings.indexOf(setting))}
                      </div>
                    </div>
                  </div>
                  
                  {editingId === setting.id ? (
                    <div className="flex items-center">
                      <input 
                        type="time" 
                        value={setting.time}
                        onChange={(e) => {
                          const newSettings = [...timeSettings];
                          const index = newSettings.findIndex(s => s.id === setting.id);
                          newSettings[index] = {...newSettings[index], time: e.target.value};
                          setTimeSettings(newSettings);
                        }}
                        className="border rounded px-2 py-1 text-sm w-24"
                      />
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="ml-2 p-1 bg-blue-100 rounded-full"
                      >
                        <Save size={14} className="text-blue-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Clock size={14} className="text-gray-400 mr-1" />
                      <span className="text-gray-700 mr-2">{setting.time}</span>
                      <button 
                        onClick={() => setEditingId(setting.id)} 
                        className="p-1 bg-gray-200 rounded-full"
                      >
                        <Edit2 size={14} className="text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mb-2">
                  <div 
                    className="w-8 h-8 rounded-full mr-3" 
                    style={renderColorPreview(setting.r, setting.g, setting.b, setting.w)}
                  ></div>
                  <div className="flex-grow grid grid-cols-4 gap-2">
                    <div className="text-xs text-center text-red-500">R</div>
                    <div className="text-xs text-center text-green-500">G</div>
                    <div className="text-xs text-center text-blue-500">B</div>
                    <div className="text-xs text-center text-gray-500">W</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100"
                      value={setting.r}
                      onChange={(e) => handleBrightnessChange(setting.id, 'r', e.target.value)}
                      className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${setting.r}%, #e5e7eb ${setting.r}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="text-center text-xs mt-1">{setting.r}%</div>
                  </div>
                  <div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100"
                      value={setting.g}
                      onChange={(e) => handleBrightnessChange(setting.id, 'g', e.target.value)}
                      className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${setting.g}%, #e5e7eb ${setting.g}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="text-center text-xs mt-1">{setting.g}%</div>
                  </div>
                  <div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100"
                      value={setting.b}
                      onChange={(e) => handleBrightnessChange(setting.id, 'b', e.target.value)}
                      className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${setting.b}%, #e5e7eb ${setting.b}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="text-center text-xs mt-1">{setting.b}%</div>
                  </div>
                  <div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100"
                      value={setting.w}
                      onChange={(e) => handleBrightnessChange(setting.id, 'w', e.target.value)}
                      className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #9ca3af 0%, #9ca3af ${setting.w}%, #e5e7eb ${setting.w}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="text-center text-xs mt-1">{setting.w}%</div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 flex justify-center">
              <button className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm flex items-center">
                <Save size={14} className="mr-1" />
                保存设置
              </button>
            </div>
          </div>
        )}
        
        {/* 预设场景 */}
        {selectedTab === 'presets' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">预设场景</h4>
            <div className="grid grid-cols-3 gap-3">
              {presetScenes.map((preset) => (
                <div 
                  key={preset.id} 
                  className={`p-3 rounded-xl flex flex-col items-center cursor-pointer transition-all ${
                    activePreset === preset.id 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => setActivePreset(preset.id)}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                    style={renderColorPreview(preset.r, preset.g, preset.b, preset.w)}
                  >
                    {renderPresetIcon(preset.icon)}
                  </div>
                  <span className="text-xs text-center text-gray-800">{preset.name}</span>
                </div>
              ))}
            </div>
            
            {activePreset && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">场景预览</h5>
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-full mr-4" 
                    style={renderColorPreview(
                      presetScenes.find(p => p.id === activePreset).r,
                      presetScenes.find(p => p.id === activePreset).g,
                      presetScenes.find(p => p.id === activePreset).b,
                      presetScenes.find(p => p.id === activePreset).w
                    )}
                  ></div>
                  <div className="flex-grow">
                    {activePreset === 1 ? (
                      // 自定义模式的调色面板
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-red-500 text-center mb-1">R</div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100"
                            value={presetScenes.find(p => p.id === 1).r}
                            onChange={(e) => handleCustomColorChange('r', e.target.value)}
                            className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${presetScenes.find(p => p.id === 1).r}%, #e5e7eb ${presetScenes.find(p => p.id === 1).r}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === 1).r}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-green-500 text-center mb-1">G</div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100"
                            value={presetScenes.find(p => p.id === 1).g}
                            onChange={(e) => handleCustomColorChange('g', e.target.value)}
                            className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #10b981 0%, #10b981 ${presetScenes.find(p => p.id === 1).g}%, #e5e7eb ${presetScenes.find(p => p.id === 1).g}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === 1).g}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-500 text-center mb-1">B</div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100"
                            value={presetScenes.find(p => p.id === 1).b}
                            onChange={(e) => handleCustomColorChange('b', e.target.value)}
                            className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${presetScenes.find(p => p.id === 1).b}%, #e5e7eb ${presetScenes.find(p => p.id === 1).b}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === 1).b}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 text-center mb-1">W</div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100"
                            value={presetScenes.find(p => p.id === 1).w}
                            onChange={(e) => handleCustomColorChange('w', e.target.value)}
                            className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #9ca3af 0%, #9ca3af ${presetScenes.find(p => p.id === 1).w}%, #e5e7eb ${presetScenes.find(p => p.id === 1).w}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === 1).w}%</div>
                        </div>
                      </div>
                    ) : (
                      // 其他预设模式的显示
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-red-500 text-center mb-1">R</div>
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === activePreset).r}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-green-500 text-center mb-1">G</div>
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === activePreset).g}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-500 text-center mb-1">B</div>
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === activePreset).b}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 text-center mb-1">W</div>
                          <div className="text-sm text-center font-medium">{presetScenes.find(p => p.id === activePreset).w}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm w-full">
                  应用此场景
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* 参数设置 */}
        {selectedTab === 'params' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">参数设置</h4>
            
            {/* 切换模式选项 */}
            <div className="mb-4 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Settings size={16} className="text-blue-500 mr-2" />
                  <span className="text-gray-800">切换模式</span>
                </div>
                <div className="flex items-center">
                  <span 
                    className={`text-sm cursor-pointer px-2 py-1 rounded ${transitionMode === 'gradual' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                    onClick={() => setTransitionMode('gradual')}
                  >
                    渐变
                  </span>
                  <span className="mx-1 text-gray-300">|</span>
                  <span 
                    className={`text-sm cursor-pointer px-2 py-1 rounded ${transitionMode === 'jump' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                    onClick={() => setTransitionMode('jump')}
                  >
                    跳变
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {transitionMode === 'gradual' ? 
                  '渐变模式: 颜色和亮度将平滑过渡' : 
                  '跳变模式: 颜色和亮度将立即切换'}
              </p>
            </div>
            
            {/* 群控功能 */}
            <div className="mb-4 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users size={16} className="text-blue-500 mr-2" />
                  <span className="text-gray-800">群控功能</span>
                </div>
                <div 
                  className={`w-12 h-6 ${groupControl ? 'bg-blue-500' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors`}
                  onClick={() => setGroupControl(!groupControl)}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${groupControl ? 'right-0.5' : 'left-0.5'}`}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {groupControl ? 
                  '已开启: 可同时控制多个设备' : 
                  '已关闭: 仅控制当前设备'}
              </p>
            </div>
            
            {/* 设备信息 */}
            <div className="mb-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Info size={16} className="text-blue-500 mr-2" />
                <span className="text-gray-800">设备信息</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">设备名称</span>
                  <span className="text-gray-800">{deviceInfo.deviceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">设备ID</span>
                  <span className="text-gray-800">{deviceInfo.deviceID}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">固件版本</span>
                  <span className="text-gray-800">{deviceInfo.firmwareVersion}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">最后更新</span>
                  <span className="text-gray-800">{deviceInfo.lastUpdated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IP地址</span>
                  <span className="text-gray-800">{deviceInfo.ipAddress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">MAC地址</span>
                  <span className="text-gray-800">{deviceInfo.macAddress}</span>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 bg-gray-200 text-gray-700 rounded-full px-2 py-1.5 text-xs flex items-center justify-center">
                  <Download size={12} className="mr-1" />
                  更新固件
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 rounded-full px-2 py-1.5 text-xs flex items-center justify-center">
                  <Share2 size={12} className="mr-1" />
                  设备共享
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AquariumLightController;
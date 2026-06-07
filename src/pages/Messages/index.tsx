import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ClipboardList, 
  AlertTriangle, 
  Clock,
  Check,
  CheckCheck,
  Eye,
  Trash2,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/store';
import { MESSAGE_TYPES } from '@/utils/constants';
import { formatDateTime, formatRelativeTime, cn } from '@/utils/format';

const iconMap: Record<string, React.ElementType> = {
  system: Bell,
  task: ClipboardList,
  warning: AlertTriangle,
  reminder: Clock,
};

export default function Messages() {
  const navigate = useNavigate();
  const { messages, markMessageRead, markAllMessagesRead, markMessageHandled, markAllMessagesHandled } = useAppStore();
  const [filterType, setFilterType] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filtered = messages.filter(m => {
    const matchSearch = m.title.includes(searchText) || m.content.includes(searchText);
    const matchType = filterType === 'all' || m.type === filterType;
    return matchSearch && matchType;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const unhandledCount = messages.filter(m => !m.isHandled).length;

  const handleMessageClick = (message: any) => {
    if (!message.isRead) {
      markMessageRead(message.id);
    }
    if (message.navigatePath) {
      navigate(message.navigatePath);
    }
  };

  const handleMarkHandled = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    markMessageHandled(messageId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
          <p className="text-gray-500 mt-1">系统通知和任务提醒</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-full">
            {unreadCount} 条未读
          </span>
          <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-sm font-medium rounded-full">
            {unhandledCount} 条待处理
          </span>
          <button
            onClick={markAllMessagesRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            全部已读
          </button>
          <button
            onClick={markAllMessagesHandled}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            全部已处理
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索消息标题、内容..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'system', 'task', 'warning', 'reminder'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  filterType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {type === 'all' ? '全部' : MESSAGE_TYPES[type as keyof typeof MESSAGE_TYPES]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">暂无消息</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((message) => {
              const Icon = iconMap[message.type] || Bell;
              return (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={cn(
                    "p-5 cursor-pointer transition-colors hover:bg-gray-50",
                    !message.isRead && "bg-blue-50/30",
                    message.isHandled && "opacity-75"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      message.type === 'system' && 'bg-blue-100',
                      message.type === 'task' && 'bg-yellow-100',
                      message.type === 'warning' && 'bg-red-100',
                      message.type === 'reminder' && 'bg-orange-100',
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        message.type === 'system' && 'text-blue-600',
                        message.type === 'task' && 'text-yellow-600',
                        message.type === 'warning' && 'text-red-600',
                        message.type === 'reminder' && 'text-orange-600',
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn(
                            "font-medium",
                            message.isRead ? "text-gray-600" : "text-gray-900"
                          )}>
                            {message.title}
                          </h4>
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                          {message.priority === 'high' && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">
                              高优先级
                            </span>
                          )}
                          {message.isHandled && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              已处理
                            </span>
                          )}
                          {message.navigatePath && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded font-medium flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              可跳转
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(message.createTime)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm mt-1.5 line-clamp-2",
                        message.isRead ? "text-gray-500" : "text-gray-700"
                      )}>
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>发件人：{message.sender}</span>
                          <span>{formatDateTime(message.createTime)}</span>
                          {message.relatedType && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                              关联：{message.relatedType === 'clue' ? '线索' : message.relatedType === 'visit' ? '走访' : '调解'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMessageClick(message); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!message.isHandled && (
                            <button 
                              onClick={(e) => handleMarkHandled(e, message.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="标记已处理"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

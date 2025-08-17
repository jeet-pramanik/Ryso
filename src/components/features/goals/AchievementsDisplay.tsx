import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Award, 
  Medal,
  Target,
  TrendingUp,
  Calendar,
  Gem,
  Coins,
  Banknote
} from 'lucide-react';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { useUserStore } from '@/stores/userStore';
import { Achievement } from '@/types';
import { format } from 'date-fns';

// Icon mapping for achievements
const iconMap: Record<string, React.ComponentType<any>> = {
  Target,
  TrendingUp,
  Award,
  Medal,
  Star,
  Trophy,
  Calendar,
  Gem,
  Coins,
  Banknote,
};

const AchievementsDisplay: React.FC = () => {
  const { user } = useUserStore();
  const { 
    achievements, 
    isHydrated, 
    hydrate, 
    getUnlockedAchievements, 
    getRecentAchievements,
    getTotalAchievements 
  } = useAchievementsStore();

  useEffect(() => {
    if (!isHydrated && user?.id) {
      hydrate(user.id);
    }
  }, [isHydrated, user?.id, hydrate]);

  const unlockedAchievements = getUnlockedAchievements();
  const recentAchievements = getRecentAchievements(30); // Last 30 days
  const totalCount = getTotalAchievements();

  const getAchievementIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Trophy;
    return IconComponent;
  };

  const getAchievementColor = (type: Achievement['type']) => {
    switch (type) {
      case 'GOAL':
        return 'from-blue-500 to-blue-600';
      case 'SAVINGS':
        return 'from-green-500 to-green-600';
      case 'SPENDING':
        return 'from-purple-500 to-purple-600';
      case 'BUDGET':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const groupedAchievements = unlockedAchievements.reduce((groups, achievement) => {
    const type = achievement.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border-0 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500 rounded-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-900">{totalCount} Achievement{totalCount !== 1 ? 's' : ''}</h2>
              <p className="text-yellow-700">
                {recentAchievements.length} unlocked this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.slice(0, 5).map((achievement) => {
              const Icon = getAchievementIcon(achievement.icon);
              const colorClass = getAchievementColor(achievement.type);
              
              return (
                <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClass} flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{achievement.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {achievement.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Achievements by Category */}
      {Object.entries(groupedAchievements).map(([type, typeAchievements]) => (
        <Card key={type} className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>{type.charAt(0) + type.slice(1).toLowerCase()} Achievements</span>
              <Badge variant="secondary">{typeAchievements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {typeAchievements.map((achievement) => {
                const Icon = getAchievementIcon(achievement.icon);
                const colorClass = getAchievementColor(achievement.type);
                
                return (
                  <div key={achievement.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClass} flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Unlocked on {format(new Date(achievement.unlockedAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {unlockedAchievements.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start creating goals and making contributions to unlock your first achievements!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AchievementsDisplay;

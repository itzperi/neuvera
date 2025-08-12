import React from 'react';
import { Search, HelpCircle, Bell, Plus, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-luxury w-full max-w-7xl max-h-[95vh] overflow-hidden animate-slide-up">
        {/* Header Navigation */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-lg text-foreground">TWISTY</span>
              </div>
              
              {/* Navigation */}
              <nav className="flex items-center gap-6">
                <button className="text-foreground font-medium hover:text-primary transition-colors">Home</button>
                <button className="text-muted-foreground font-medium hover:text-primary transition-colors">Messages</button>
                <button className="text-muted-foreground font-medium hover:text-primary transition-colors">Discover</button>
                <button className="text-muted-foreground font-medium hover:text-primary transition-colors">Wallet</button>
                <button className="text-muted-foreground font-medium hover:text-primary transition-colors">Projects</button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Enter your search request..." 
                  className="pl-10 w-80 bg-muted/50 border-border"
                />
              </div>
              
              {/* Icons */}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <HelpCircle size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Bell size={20} />
              </Button>
              
              {/* Profile */}
              <div className="w-8 h-8 bg-gradient-primary rounded-full"></div>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)] bg-gradient-subtle">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Income Tracker Card */}
              <Card className="p-6 bg-card shadow-elegant">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-foreground rounded-sm"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Income Tracker</h2>
                      <p className="text-sm text-muted-foreground">Track changes in income over time and access detailed data on each project and payments received</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Week</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </div>
                </div>

                {/* Chart Area */}
                <div className="relative h-48 mb-6">
                  <div className="absolute top-0 right-0 bg-foreground text-background px-3 py-1 rounded-lg text-sm font-medium">
                    $2,567
                  </div>
                  
                  {/* Simple chart representation */}
                  <div className="flex items-end justify-between h-full pt-8">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={day} className="flex flex-col items-center gap-2">
                        <div 
                          className="w-8 bg-primary/20 rounded-t-lg"
                          style={{ height: `${20 + index * 15}px` }}
                        ></div>
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-xs text-muted-foreground w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">+20%</div>
                    <div className="text-sm text-muted-foreground">This week's income is higher than last week's</div>
                  </div>
                </div>
              </Card>

              {/* Let's Connect Section */}
              <Card className="p-6 bg-card shadow-elegant">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Let's Connect</h3>
                  <button className="text-primary text-sm hover:text-primary-glow transition-colors">See all</button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">Randy Gouse</span>
                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">Senior</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Cybersecurity specialist</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Plus size={20} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">Giana Schleifer</span>
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Middle</span>
                        </div>
                        <p className="text-sm text-muted-foreground">UX/UI Designer</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Plus size={20} />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Your Recent Projects */}
              <Card className="p-6 bg-card shadow-elegant">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Recent Projects</h3>
                  <button className="text-primary text-sm hover:text-primary-glow transition-colors">See all Project</button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">😊</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Web Development Project</span>
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Paid</span>
                          </div>
                          <p className="text-sm text-muted-foreground">$10/hour</p>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Remote</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Part-time</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">This project involves implementing both frontend and backend functionalities, as well as integrating with third-party APIs.</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>📍 Germany</span>
                      <span className="ml-4">2h ago</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-foreground text-xs">⚖️</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Copyright Project</span>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Not Paid</span>
                          </div>
                          <p className="text-sm text-muted-foreground">$10/hour</p>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-primary text-xs">🎨</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Web Design Project</span>
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Paid</span>
                          </div>
                          <p className="text-sm text-muted-foreground">$10/hour</p>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Unlock Premium Features */}
              <Card className="p-6 bg-gradient-subtle shadow-elegant">
                <h3 className="text-lg font-semibold text-foreground mb-2">Unlock Premium Features</h3>
                <p className="text-sm text-muted-foreground mb-4">Get access to exclusive benefits and expand your freelancing opportunities.</p>
                <Button variant="outline" className="w-full">
                  Upgrade now →
                </Button>
              </Card>

              {/* Proposal Progress */}
              <Card className="p-6 bg-card shadow-elegant">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Proposal Progress</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">📅 April 11, 2024</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">64</div>
                    <div className="text-sm text-muted-foreground mb-2">Proposals sent</div>
                    <div className="h-16 flex items-end">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="w-1 bg-muted mr-1 rounded-t" style={{ height: `${Math.random() * 60 + 10}px` }}></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">12</div>
                    <div className="text-sm text-muted-foreground mb-2">Interviews</div>
                    <div className="h-16 flex items-end">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="w-1 bg-destructive/60 mr-1 rounded-t" style={{ height: `${Math.random() * 50 + 15}px` }}></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">10</div>
                    <div className="text-sm text-muted-foreground mb-2">Hires</div>
                    <div className="h-16 flex items-end">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="w-1 bg-primary mr-1 rounded-t" style={{ height: `${Math.random() * 40 + 20}px` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
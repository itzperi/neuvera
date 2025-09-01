'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SystemConfiguration() {
  // State for general settings
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [samplingRate, setSamplingRate] = useState(100);
  const [storageRetention, setStorageRetention] = useState('90');
  const [trackingDomain, setTrackingDomain] = useState('track.neuvera.io');
  
  // State for privacy settings
  const [anonymizeIp, setAnonymizeIp] = useState(true);
  const [cookieConsent, setCookieConsent] = useState(true);
  const [cookieExpiry, setCookieExpiry] = useState('365');
  const [privacyPolicy, setPrivacyPolicy] = useState('https://neuvera.io/privacy');
  
  // State for event tracking settings
  const [trackPageViews, setTrackPageViews] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [trackForms, setTrackForms] = useState(true);
  const [trackErrors, setTrackErrors] = useState(true);
  const [trackCustomEvents, setTrackCustomEvents] = useState(true);
  
  // State for integration settings
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [facebookPixelId, setFacebookPixelId] = useState('');
  const [hubspotId, setHubspotId] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  
  // State for saving status
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  
  // Handle save configuration
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would save to an API
      console.log('Saving configuration:', {
        general: {
          trackingEnabled,
          samplingRate,
          storageRetention,
          trackingDomain
        },
        privacy: {
          anonymizeIp,
          cookieConsent,
          cookieExpiry,
          privacyPolicy
        },
        events: {
          trackPageViews,
          trackClicks,
          trackForms,
          trackErrors,
          trackCustomEvents
        },
        integrations: {
          googleAnalyticsId,
          facebookPixelId,
          hubspotId,
          slackWebhook
        }
      });
      
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Configuration</h2>
          <p className="text-muted-foreground">Configure tracking system settings</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Configuration
          </Button>
          
          {saveStatus === 'success' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Settings saved successfully
            </Badge>
          )}
          
          {saveStatus === 'error' && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Error saving settings
            </Badge>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-4 w-[600px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="events">Event Tracking</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic tracking settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tracking-enabled">Tracking Enabled</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable all tracking functionality</p>
                </div>
                <Switch
                  id="tracking-enabled"
                  checked={trackingEnabled}
                  onCheckedChange={setTrackingEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sampling-rate">Sampling Rate ({samplingRate}%)</Label>
                <p className="text-sm text-muted-foreground">Percentage of users to track</p>
                <Slider
                  id="sampling-rate"
                  min={1}
                  max={100}
                  step={1}
                  value={[samplingRate]}
                  onValueChange={(value) => setSamplingRate(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storage-retention">Data Retention Period</Label>
                <p className="text-sm text-muted-foreground">How long to keep tracking data</p>
                <Select value={storageRetention} onValueChange={setStorageRetention}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tracking-domain">Tracking Domain</Label>
                <p className="text-sm text-muted-foreground">Domain used for tracking requests</p>
                <Input
                  id="tracking-domain"
                  value={trackingDomain}
                  onChange={(e) => setTrackingDomain(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Configure privacy and compliance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymize-ip">Anonymize IP Addresses</Label>
                  <p className="text-sm text-muted-foreground">Mask the last octet of user IP addresses</p>
                </div>
                <Switch
                  id="anonymize-ip"
                  checked={anonymizeIp}
                  onCheckedChange={setAnonymizeIp}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cookie-consent">Require Cookie Consent</Label>
                  <p className="text-sm text-muted-foreground">Only track users who have accepted cookies</p>
                </div>
                <Switch
                  id="cookie-consent"
                  checked={cookieConsent}
                  onCheckedChange={setCookieConsent}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cookie-expiry">Cookie Expiration</Label>
                <p className="text-sm text-muted-foreground">How long tracking cookies persist</p>
                <Select value={cookieExpiry} onValueChange={setCookieExpiry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cookie expiry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacy-policy">Privacy Policy URL</Label>
                <p className="text-sm text-muted-foreground">Link to your privacy policy</p>
                <Input
                  id="privacy-policy"
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Tracking Settings</CardTitle>
              <CardDescription>Configure which events to track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track-pageviews">Track Page Views</Label>
                  <p className="text-sm text-muted-foreground">Record when users view pages</p>
                </div>
                <Switch
                  id="track-pageviews"
                  checked={trackPageViews}
                  onCheckedChange={setTrackPageViews}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track-clicks">Track Clicks</Label>
                  <p className="text-sm text-muted-foreground">Record when users click elements</p>
                </div>
                <Switch
                  id="track-clicks"
                  checked={trackClicks}
                  onCheckedChange={setTrackClicks}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track-forms">Track Form Submissions</Label>
                  <p className="text-sm text-muted-foreground">Record when users submit forms</p>
                </div>
                <Switch
                  id="track-forms"
                  checked={trackForms}
                  onCheckedChange={setTrackForms}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track-errors">Track JavaScript Errors</Label>
                  <p className="text-sm text-muted-foreground">Record client-side errors</p>
                </div>
                <Switch
                  id="track-errors"
                  checked={trackErrors}
                  onCheckedChange={setTrackErrors}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track-custom">Track Custom Events</Label>
                  <p className="text-sm text-muted-foreground">Allow tracking of custom-defined events</p>
                </div>
                <Switch
                  id="track-custom"
                  checked={trackCustomEvents}
                  onCheckedChange={setTrackCustomEvents}
                />
              </div>
              
              <div className="pt-4">
                <Label htmlFor="custom-events-code">Custom Events Tracking Code</Label>
                <p className="text-sm text-muted-foreground mb-2">JavaScript code for custom event tracking</p>
                <Textarea
                  id="custom-events-code"
                  className="font-mono text-sm h-32"
                  placeholder="// Example: track('custom_event', { category: 'engagement', action: 'click' });"
                  disabled={!trackCustomEvents}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ga-id">Google Analytics ID</Label>
                <p className="text-sm text-muted-foreground">Your Google Analytics tracking ID</p>
                <Input
                  id="ga-id"
                  placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
                <p className="text-sm text-muted-foreground">Your Facebook Pixel tracking ID</p>
                <Input
                  id="fb-pixel"
                  placeholder="XXXXXXXXXXXXXXXXXX"
                  value={facebookPixelId}
                  onChange={(e) => setFacebookPixelId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hubspot-id">HubSpot Tracking ID</Label>
                <p className="text-sm text-muted-foreground">Your HubSpot tracking ID</p>
                <Input
                  id="hubspot-id"
                  placeholder="XXXXXXXX"
                  value={hubspotId}
                  onChange={(e) => setHubspotId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <p className="text-sm text-muted-foreground">For sending tracking notifications to Slack</p>
                <Input
                  id="slack-webhook"
                  placeholder="https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Configure automatic data exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Automatic data export configuration will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
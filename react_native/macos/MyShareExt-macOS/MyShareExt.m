//
//  MyShareExt.m
//  MyShareExt
//
//  Created by Uranus on 3/8/21.
//

#import <Foundation/Foundation.h>
#import "ReactNativeShareExtension.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLog.h>

@interface MyShareExt : ReactNativeShareExtension
@end

@implementation MyShareExt

- (NSString *)nibName {
    return @"MyShareExt";
}

RCT_EXPORT_MODULE();


- (NSURL *)sourceURLForBridge {
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:@"main"]; // .jsbundle;
}


- (NSView*) shareView {
  NSURL *jsCodeLocation = [self sourceURLForBridge];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL: jsCodeLocation
                                                      moduleName: @"MyShareExt"
                                               initialProperties: nil
                                                   launchOptions: nil];
  
  // Uncomment for console output in Xcode console for release mode on device:
  // RCTSetLogThreshold(RCTLogLevelInfo - 1);
  
  return rootView;
}

@end

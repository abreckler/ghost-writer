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

RCT_EXPORT_MODULE();


- (NSURL *)sourceURLForBridge {
 #ifdef DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
 #else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsBundle"];
 #endif
}


- (UIView*) shareView {
  NSURL *jsCodeLocation = [self sourceURLForBridge];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL: jsCodeLocation
                                                      moduleName: @"MyShareExt"
                                               initialProperties: nil
                                                   launchOptions: nil];
  rootView.backgroundColor = nil;
  
  // Uncomment for console output in Xcode console for release mode on device:
  // RCTSetLogThreshold(RCTLogLevelInfo - 1);
  
  return rootView;
}

@end

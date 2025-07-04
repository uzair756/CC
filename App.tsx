import * as React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {IndexPage} from './pages/Landing/IndexPage';
import {LandingScreen} from './pages/Landing/LandingScreen';
import {Login} from './pages/Landing/Login';
import {AdminLogin} from './pages/Admin/AdminLogin';
import {CoachLogin} from './pages/Coach/CoachLogin';
import {CoordinatorLogin} from './pages/Coordinator/CoordinatorLogin';
import {AdminLandingPage} from './pages/Admin/AdminLandingPage';
import {CoachLandingPage} from './pages/Coach/CoachLandingPage';
import {CoordinatorLandingPage} from './pages/Coordinator/CoordinatorLandingPage';
import {RepLogin} from './pages/Rep/RepLogin';
import {RepLandingPage} from './pages/Rep/RepLandingPage';
import {NominationCategories} from './pages/Rep/NominationCatgories';
import {NominationForm} from './pages/Rep/NominationForm';
import {TrialsConfirmation} from './pages/Rep/TrialsConfirmation';
import {CaptainLogin} from './pages/Captain/CaptainLogin';
import {CaptainLandingPage} from './pages/Captain/CaptainLandingPage';
import {CaptainsAccountCreate} from './pages/Rep/CaptainsAccountCreate';
import {FeedScreen} from './pages/Landing/FeedScreen';
import {RulesScreen} from './pages/Landing/RulesScreen';
import {LiveMatchesScreen} from './pages/Landing/LiveMatchesScreen';
import {RecentMatchesScreen} from './pages/Landing/RecentMatchesScreen';
import {HistoryScreen} from './pages/Landing/HistoryScreen';
import {UpcomingMatchesScreen} from './pages/Landing/UpcomingMatchesScreen';
import {MenuScreen} from './pages/Landing/MenuScreen';
import {PoolsCreateSchedulingPage} from './pages/Coach/PoolsCreateSchedulingPage';
import {RefLogin} from './pages/ Referee/RefLogin';
import {RefLandingPage} from './pages/ Referee/RefLandingPage';
import {PastYearPoolsAndSchedules} from './pages/Coach/PastYearPoolsAndSchedules';
import {RefSelectedPlayerPage} from './pages/ Referee/RefSelectedPlayerPage';
import {FootballScoreUpdatePage} from './pages/Football/FootballScoreUpdate';
import {VolleyballScoreUpdatePage} from './pages/Volleyball/VolleyballScoreUpdatePage';
import {BasketballScoreUpdatePage} from './pages/Basketball/BasketballScoreUpdatePage';
import {TennisScoreUpdatePage} from './pages/Tennis/TennisScoreUpdatePage';
import {FutsalScoreUpdatePage} from './pages/Futsal/FutsalScoreUpdatePage';
import {TableTennisScoreUpdatePage} from './pages/TableTennis/TableTennisScoreUpdatePage';
import {SnookerScoreUpdatePage} from './pages/Snooker/SnookerScoreUpdatePage';
import {TugofWarScoreUpdatePage} from './pages/TugofWar/TugofWarScoreUpdatePage';
import {BadmintonScoreUpdatePage} from './pages/Badminton/BadmintonScoreUpdatePage';
import FootballPenalties from './pages/Football/FootballPenalties';
import {CricketScoreUpdate} from './pages/Cricket/CricketScoreUpdate';
import {CricketToss} from './pages/Cricket/CricketToss';
import {CricketStartingPlayers} from './pages/Cricket/CricketStartingPlayers';
import {CricketStartingPlayers2ndInnings} from './pages/Cricket/CricketStartingPlayers2ndInnings';
import {CricketScoreUpdateSecondInning} from './pages/Cricket/CricketScoreUpdateSecondInning';
import {FutsalPenalties} from './pages/Futsal/FutsalPenalties';
import {BestCricketerPage} from './pages/Cricket/BestCricketerPage';
import {CricketMatchDetailScreen} from './pages/Cricket/GameStats';
import {CricketSuperOver} from './pages/Cricket/CricketScoreUpdateSuper';
import { SettingsScreen } from './pages/Landing/SettingsScreen';
import { BestFootballPlayerPage } from './pages/Football/BestFootballPlayerPage';
import { BestFutsalPlayerPage } from './pages/Futsal/BestFutsalPlayerPage';
import { BestBasketballPlayerPage } from './pages/Basketball/BestBasketballPlayerPage';
import { AddDepartments } from './pages/Admin/AddDepartments';
import { DSANominationView } from './pages/Admin/DSANominationView';
import {DSAScheduleManagement} from './pages/Admin/DSAScheduleManagement';
import { YearSelectionScreen } from './pages/Coach/YearSelectionScreen';
import { PlayersPerformanceCheck } from './pages/Admin/PlayersPerformanceCheck';
import { ManageAccounts } from './pages/Admin/ManageAccounts';
const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <>
      {/* Global StatusBar configuration */}
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />

      {/* Navigation Container */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="IndexPage">
          <Stack.Screen
            name="IndexPage"
            component={IndexPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminLogin"
            component={AdminLogin}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CoachLogin"
            component={CoachLogin}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CoordinatorLogin"
            component={CoordinatorLogin}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AdminLandingPage"
            component={AdminLandingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CoachLandingPage"
            component={CoachLandingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CoordinatorLandingPage"
            component={CoordinatorLandingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RepLogin"
            component={RepLogin}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RefLogin"
            component={RefLogin}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RepLandingPage"
            component={RepLandingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RefLandingPage"
            component={RefLandingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="NominationCategories"
            component={NominationCategories}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="NominationForm"
            component={NominationForm}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="TrialsConfirmation"
            component={TrialsConfirmation}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CaptainLogin"
            component={CaptainLogin}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CaptainLandingPage"
            component={CaptainLandingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CaptainsAccountCreate"
            component={CaptainsAccountCreate}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FeedScreen"
            component={FeedScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RulesScreen"
            component={RulesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="LiveMatchesScreen"
            component={LiveMatchesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RecentMatchesScreen"
            component={RecentMatchesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UpcomingMatchesScreen"
            component={UpcomingMatchesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="HistoryScreen"
            component={HistoryScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="MenuScreen"
            component={MenuScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="PoolsCreateSchedulingPage"
            component={PoolsCreateSchedulingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="PastYearPoolsAndSchedules"
            component={PastYearPoolsAndSchedules}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RefSelectedPlayerPage"
            component={RefSelectedPlayerPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FootballScoreUpdatePage"
            component={FootballScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CricketScoreUpdate"
            component={CricketScoreUpdate}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="CricketMatchDetailScreen"
            component={CricketMatchDetailScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="VolleyballScoreUpdatePage"
            component={VolleyballScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="TennisScoreUpdatePage"
            component={TennisScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FutsalScoreUpdatePage"
            component={FutsalScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="TableTennisScoreUpdatePage"
            component={TableTennisScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SnookerScoreUpdatePage"
            component={SnookerScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="TugofWarScoreUpdatePage"
            component={TugofWarScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BadmintonScoreUpdatePage"
            component={BadmintonScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FootballPenalties"
            component={FootballPenalties}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CricketToss"
            component={CricketToss}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CricketStartingPlayers"
            component={CricketStartingPlayers}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CricketStartingPlayers2ndInnings"
            component={CricketStartingPlayers2ndInnings}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CricketScoreUpdateSecondInning"
            component={CricketScoreUpdateSecondInning}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="CricketSuperOver"
            component={CricketSuperOver}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FutsalPenalties"
            component={FutsalPenalties}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BasketballScoreUpdatePage"
            component={BasketballScoreUpdatePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BestCricketerPage"
            component={BestCricketerPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SettingsScreen"
            component={SettingsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BestFootballPlayerPage"
            component={BestFootballPlayerPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BestFutsalPlayerPage"
            component={BestFutsalPlayerPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BestBasketballPlayerPage"
            component={BestBasketballPlayerPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AddDepartments"
            component={AddDepartments}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="DSANominationView"
            component={DSANominationView}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="DSAScheduleManagement"
            component={DSAScheduleManagement}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="YearSelectionScreen"
            component={YearSelectionScreen}
            options={{headerShown: false}}
          />
          
          <Stack.Screen
            name="PlayersPerformanceCheck"
            component={PlayersPerformanceCheck}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ManageAccounts"
            component={ManageAccounts}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default MyStack;

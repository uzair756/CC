import * as React from 'react';
import { StatusBar} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IndexPage } from './pages/IndexPage';
import { LandingScreen } from './pages/LandingScreen';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { CoachLogin } from './pages/CoachLogin';
import { CoordinatorLogin } from './pages/CoordinatorLogin';
import { AdminLandingPage } from './pages/AdminLandingPage';
import { CoachLandingPage } from './pages/CoachLandingPage';
import { CoordinatorLandingPage } from './pages/CoordinatorLandingPage';
import { RepLogin } from './pages/RepLogin';
import { RepLandingPage } from './pages/RepLandingPage';
import { NominationCategories } from './pages/NominationCatgories';
import { NominationForm } from './pages/NominationForm';
import { TrialsConfirmation } from './pages/TrialsConfirmation';
import { CaptainLogin } from './pages/CaptainLogin';
import { CaptainLandingPage } from './pages/CaptainLandingPage';
import { CaptainsAccountCreate } from './pages/CaptainsAccountCreate';
import { FeedScreen } from './pages/FeedScreen';
import { RulesScreen } from './pages/RulesScreen';
import { LiveMatchesScreen } from './pages/LiveMatchesScreen';
import { RecentMatchesScreen } from './pages/RecentMatchesScreen';
import { HistoryScreen } from './pages/HistoryScreen';
import { UpcomingMatchesScreen } from './pages/UpcomingMatchesScreen';
import { MenuScreen } from './pages/MenuScreen';
import { PoolsCreateSchedulingPage } from './pages/PoolsCreateSchedulingPage';
import { RefLogin } from './pages/RefLogin';
import { RefLandingPage } from './pages/RefLandingPage';
import { PastYearPoolsAndSchedules } from './pages/PastYearPoolsAndSchedules';
import { RefScoreUpdatePage } from './pages/RefScoreUpdatePage';
import { FootballScoreUpdatePage } from './pages/FootballScoreUpdate';
import { CricketScoreUpdatePage } from './pages/CricketScoreUpdate';
import { VolleyballScoreUpdatePage } from './pages/VolleyballScoreUpdate';
import { BasketballScoreUpdatePage } from './pages/BasketballScoreUpdate';
import { TennisScoreUpdatePage } from './pages/TennisScoreUpdate';
import { FutsalScoreUpdatePage } from './pages/FutsalScoreUpdatePage';
import { TableTennisMScoreUpdatePage } from './pages/TableTennisMScoreUpdate';
import { TableTennisFScoreUpdatePage } from './pages/TableTennisFScoreUpdate';
import { SnookerScoreUpdatePage } from './pages/SnookerScoreUpdatePage';
import { TugofWarMScoreUpdatePage } from './pages/TugofWarMScoreUpdate';
import { TugofWarFScoreUpdatePage } from './pages/TugofWarFScoreUpdate';
import { BadmintonMScoreUpdatePage } from './pages/BadmintonMScoreUpdate';
import { BadmintonFScoreUpdatePage } from './pages/BadmintonFScoreUpdate';
const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <>
      {/* Global StatusBar configuration */}
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />

      {/* Navigation Container */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="IndexPage">
          <Stack.Screen name="IndexPage" component={IndexPage} options={{ headerShown: false }} />
          <Stack.Screen name="LandingScreen" component={LandingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="AdminLogin" component={AdminLogin} options={{ headerShown: false }} />
          <Stack.Screen name="CoachLogin" component={CoachLogin} options={{ headerShown: false }} />
          <Stack.Screen name="CoordinatorLogin" component={CoordinatorLogin} options={{ headerShown: false }} />
          <Stack.Screen name="AdminLandingPage" component={AdminLandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="CoachLandingPage" component={CoachLandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="CoordinatorLandingPage" component={CoordinatorLandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="RepLogin" component={RepLogin} options={{ headerShown: false }} />
          <Stack.Screen name="RefLogin" component={RefLogin} options={{ headerShown: false }} />
          <Stack.Screen name="RepLandingPage" component={RepLandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="RefLandingPage" component={RefLandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="NominationCategories" component={NominationCategories} options={{ headerShown: false }} />
          <Stack.Screen name="NominationForm" component={NominationForm} options={{ headerShown: false }} />
          <Stack.Screen name="TrialsConfirmation" component={TrialsConfirmation} options={{ headerShown: false }} />
          <Stack.Screen name="CaptainLogin" component={CaptainLogin} options={{ headerShown: false }} />
          <Stack.Screen name="CaptainLandingPage" component={CaptainLandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="CaptainsAccountCreate" component={CaptainsAccountCreate} options={{ headerShown: false }} />
          <Stack.Screen name="FeedScreen" component={FeedScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RulesScreen" component={RulesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LiveMatchesScreen" component={LiveMatchesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RecentMatchesScreen" component={RecentMatchesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UpcomingMatchesScreen" component={UpcomingMatchesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PoolsCreateSchedulingPage" component={PoolsCreateSchedulingPage} options={{ headerShown: false }} />
          <Stack.Screen name="PastYearPoolsAndSchedules" component={PastYearPoolsAndSchedules} options={{ headerShown: false }} />
          <Stack.Screen name="RefScoreUpdatePage" component={RefScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="FootballScoreUpdatePage" component={FootballScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="CricketScoreUpdatePage" component={CricketScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="VolleyballScoreUpdatePage" component={VolleyballScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="BasketballScoreUpdatePage" component={BasketballScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="TennisScoreUpdatePage" component={TennisScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="FutsalScoreUpdatePage" component={FutsalScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="TableTennisMScoreUpdatePage" component={TableTennisMScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="TableTennisFScoreUpdatePage" component={TableTennisFScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="SnookerScoreUpdatePage" component={SnookerScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="TugofWarMScoreUpdatePage" component={TugofWarMScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="TugofWarFScoreUpdatePage" component={TugofWarFScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="BadmintonMScoreUpdatePage" component={BadmintonMScoreUpdatePage} options={{ headerShown: false }} />
          <Stack.Screen name="BadmintonFScoreUpdatePage" component={BadmintonFScoreUpdatePage} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default MyStack;

import React from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  Platform
} from 'react-native';
import { welcomeStyles } from '../styles/WelcomeScreenStyles';

export default function WelcomeScreen({ navigation }) {

  const goToRegisterScreen = () => {
    navigation.navigate('Register');
  };

  const goToLoginScreen = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={welcomeStyles.container}>
      <ScrollView 
        style={welcomeStyles.container}
        contentContainerStyle={welcomeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground 
          source={require('../../assets/fundoHome.png')} 
          style={welcomeStyles.backgroundImage}
          resizeMode="cover"
        >
          <View style={welcomeStyles.overlay}>
            <View style={welcomeStyles.header}>
              <Text style={welcomeStyles.title}>
                Appointment <Text style={welcomeStyles.titleAccent}>Services</Text>
              </Text>
            </View>
            
            <Text style={welcomeStyles.subtitle}>
              Conectamos você aos profissionais mais qualificados{'\n'}
              para resolver suas necessidades com excelência
            </Text>

            <View style={welcomeStyles.featuresContainer}>
              <View style={welcomeStyles.featureItem}>
                <View style={welcomeStyles.featureIcon}>
                  <Text style={welcomeStyles.featureIconText}>✓</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={welcomeStyles.featureText}>Profissionais Verificados</Text>
                  <Text style={welcomeStyles.featureDescription}>
                    Especialistas qualificados e com histórico comprovado
                  </Text>
                </View>
              </View>
              
              <View style={welcomeStyles.featureItem}>
                <View style={welcomeStyles.featureIcon}>
                  <Text style={welcomeStyles.featureIconText}>⏱</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={welcomeStyles.featureText}>Agendamento Instantâneo</Text>
                  <Text style={welcomeStyles.featureDescription}>
                    Reserve serviços rapidamente no horário desejado
                  </Text>
                </View>
              </View>
              
              <View style={welcomeStyles.featureItem}>
                <View style={welcomeStyles.featureIcon}>
                  <Text style={welcomeStyles.featureIconText}>★</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={welcomeStyles.featureText}>Avaliações Transparentes</Text>
                  <Text style={welcomeStyles.featureDescription}>
                    Decisões baseadas em feedbacks reais de clientes
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={welcomeStyles.primaryButton} onPress={goToRegisterScreen}>
              <Text style={welcomeStyles.primaryButtonText}>Registrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={welcomeStyles.secondaryButton} onPress={goToLoginScreen}>
              <Text style={welcomeStyles.secondaryButtonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={welcomeStyles.footer}>
              <Text style={welcomeStyles.footerText}>
                Junte-se a milhares de clientes satisfeitos
              </Text>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}
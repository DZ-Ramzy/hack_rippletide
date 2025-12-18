"""
Simple test script for TruthLens
Tests the core verification functionality
"""
import os
from verification_engine import VerificationEngine
from config import Config

def test_simple_question():
    """Test with a simple, verifiable question"""
    print("🔍 TruthLens - Simple Test")
    print("=" * 50)
    
    # Check configuration
    try:
        Config.validate()
        print(f"✅ Configuration valid")
        print(f"   Provider: {Config.LLM_PROVIDER}")
        print(f"   Search: {Config.SEARCH_PROVIDER}")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("\n💡 Please set up your .env file first.")
        print("   Run: python setup_env.py")
        return
    
    print()
    
    # Initialize engine
    print("Initializing verification engine...")
    try:
        engine = VerificationEngine()
        print("✅ Engine initialized")
    except Exception as e:
        print(f"❌ Initialization error: {e}")
        return
    
    print()
    
    # Test question
    question = "What is Python programming language?"
    print(f"Question: {question}")
    print()
    print("Generating and verifying answer...")
    print("(This may take 10-30 seconds)")
    print()
    
    try:
        results = engine.generate_and_verify(question)
        
        print("=" * 50)
        print("RESULTS")
        print("=" * 50)
        
        # Display answer
        print("\n📝 Answer:")
        print(results['answer'])
        
        # Display verification
        verification = results['verification']
        print(f"\n📊 Confidence Score: {verification['overall_confidence']}%")
        
        # Display claims
        claims = verification.get('claims', [])
        print(f"\n🔍 Claims Analyzed: {len(claims)}")
        
        for i, claim in enumerate(claims, 1):
            status = claim.get('status', 'unknown')
            text = claim.get('text', '')
            print(f"\n   Claim {i}:")
            print(f"   Status: {status}")
            print(f"   Text: {text[:100]}...")
        
        # Display sources
        sources = results.get('sources', [])
        print(f"\n📚 Sources Found: {len(sources)}")
        
        if sources:
            for i, source in enumerate(sources[:3], 1):
                print(f"   {i}. {source.get('title', 'Unknown')}")
        
        print("\n" + "=" * 50)
        print("✅ Test completed successfully!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Error during verification: {e}")
        print("\nTroubleshooting:")
        print("1. Check your API key is valid")
        print("2. Verify you have internet connection")
        print("3. Check API rate limits")

if __name__ == "__main__":
    test_simple_question()


#!/bin/bash
cd /Users/nogamesense2/DutyNotFree/javaBackend

echo "🧪 =========================================="
echo "🧪 Testing Calculator Microservice..."
echo "🧪 =========================================="
mvn test -Dtest=Calculator*Test -q | tail -5
echo ""

echo "🧪 =========================================="
echo "🧪 Testing Tariff Microservice..."
echo "🧪 =========================================="
mvn test -Dtest=Tariff*Test -q | tail -5
echo ""

echo "🧪 =========================================="
echo "🧪 Testing Product Microservice..."
echo "🧪 =========================================="
mvn test -Dtest=Product*Test -q | tail -5
echo ""

echo "📊 =========================================="
echo "📊 Generating Coverage Report..."
echo "📊 =========================================="
mvn jacoco:report -q
echo "✅ Coverage report: target/site/jacoco/index.html"
echo ""
echo "✅ All tests completed!"
